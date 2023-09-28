import User from '../models/userModel'
import Friend from '../models/friendModel'
import {Request, ResponseToolkit} from '@hapi/hapi'
import argon2 from 'argon2'
import boom from '@hapi/boom'
import { pubDir } from '../server'
import jimp from 'jimp'
import { UserInput } from '../types/inputTypes'
import { UserType } from '../types/types'
import Errors from '../errorHandling/errorDictionary'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { generateToken } from '../middlewares/auth'
import knex from '../db/knex'
import validator from 'validator'


export default class UserCtrl {


    public async userSignIn (request: Request, reply: ResponseToolkit){
        //let query = knex.raw('SELECT `id`, `password`, `lastname`, `firstname`, `email`, `profile_picture`, `country` from users')

        let payload = request.payload as UserInput
        if (!payload) return Errors.no_payload
        if (!payload.email || !payload.password) return boom.badRequest('Veuillez fournir une adresse email et un mot de passe')
        
        let user = new User()
        let userInfo = await user.fetchByEmail(payload.email)
            .catch(() => { throw Errors.unidentified })

        if (userInfo === undefined || !await argon2.verify(userInfo.password!, payload.password)){
            return boom.unauthorized('Adresse email ou mot de passe incorrect')
        }
        delete userInfo.password
        
        const token: string = generateToken(userInfo.id, payload.email)

        return (
            reply.response({
                user: userInfo,
                token: token
            })
            .code(201)
        )
        
    }

    public async authFromExt (request: Request, reply: ResponseToolkit){
        let id = request.query.id
        if (!id){
            throw Errors.no_user_id
        }
        if (request.auth.credentials.sub != id){
            throw boom.unauthorized("L'id en paramètre d'url n'est pas le même que celui indiqué dans le token")
        }
        return reply.response().code(204)
    }


    public async createUser (request: Request, reply: ResponseToolkit) {
        if (!request.payload) {
            throw Errors.no_payload
        }
        if (typeof request.payload != "object"){
            throw boom.badRequest("Veuillez envoyer le payload en format application/json ou application/x-www-form-urlencoded (spécifiez dans le header Content-Type)")
        }
        let payload = request.payload as UserInput

        let checker = new Checker()
        let err: string[] = checker.check(payload, ValidationModels.CreateUser)
        if (err.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: err
            })
            .code(422)
        }

        let user = new User()
        let previous = await user.fetchByEmail((payload).email, 'idOnly')
        if (previous != undefined){
            return Errors.existing_user
        }
        
        payload.password = await argon2.hash(payload.password)
            .catch(() => {
                throw boom.badData('Une erreur est survenue avec le mot de passe, veuillez en fournir un autre.')
            })

        checker.sanitize(payload)

        const newUser = await user.create(payload)
            .catch(() => { 
                throw Errors.unidentified 
            })

        return reply.response({
                id: newUser,
                newRessource: `./users/${newUser}`
            })
            .code(201)
    }


    public async getUserById (request: Request){
        let id = request.params?.id
        if (!id) {
            return Errors.no_id
        }
        return await new User().fetch(id)
                .then(user => user || Errors.not_found_2)
                .catch(() => Errors.unidentified)
    }


    public async updateUser (request: Request, reply: ResponseToolkit){
        let payload = request.payload as UserInput
        let userId = request.params.id
        if (!userId) return Errors.no_id
        if (!payload) return Errors.no_payload

        let checker = new Checker()
        let err: string[] = checker.check(payload , ValidationModels.UpdateUser)
        if (err.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: err
            })
            .code(422)
        }

        if (payload.password != null){
            payload.password = await argon2.hash(payload.password)
        }

        const user = new User() 
        if (payload.email){
            let previous = await user.fetchByEmail(payload.email, 'idOnly')
            if (previous != undefined) {
                return Errors.existing_user
            }
        }

        checker.sanitize(payload)

        let updated = await user.update(userId, payload)
            .catch(() => { throw Errors.unidentified })

        return reply.response({updatedRows: updated}).code(200)
    }


    public async deleteUser (request: Request){
        let id = request.params.id
        if (!parseInt(id)){
            return boom.badRequest()
        }
        let response = await new User().delete(id)
        return { affectedRows: response }
    }

    
    public async getFeed (request: Request) {
        let id = request.params?.id
        let page = request.query?.page ?? '1'
        if (!id) return Errors.no_user_id

        if (isNaN(page)){
            return boom.badRequest('Veuillez fournir un numéro de page valide (e.g ?page=69)')
        }

        let user = new User()
        let friend = new Friend()

        const friendShips = await friend.fetchAll(id).catch(() => null) // renvoie null si erreur
        if (friendShips === null) return Errors.unidentified
       
        const friendIds: number[] = []
        const friends: UserType[] = []

        for (const fr of friendShips){
            let friendId = (id == fr.user1_id)
                ? fr.user2_id
                : fr.user1_id
            friendIds.push(friendId)
            //
            let friendInfo = await user.fetch(friendId, 'basicInfo')
            if (friendInfo) friends.push(friendInfo)
        }

        const feed = await user.fetchFeed(friendIds, parseInt(page)).catch(() => null)
        if (feed === null){
            return Errors.unidentified
        }

        feed.forEach((review) => {
            for (const friend of friends){
                if (review.user_id == friend.id) {
                    review.owner = friend
                }
            }
        })
        
        return feed
    }

    public async getProfilePic(request: Request, reply: ResponseToolkit) {
        let id = request.params?.id
        if (!id) return Errors.no_user_id

        return reply.file(`profile-pictures/user-${id}.jpg`)
    }

    public async setProfilePic(request: Request, reply: ResponseToolkit) {
        let id = request.params?.id
        if (!id) return Errors.no_user_id

        let maxBytes = 2000000
        let img = request.payload as {path: string, bytes: number}
        if (img.bytes > maxBytes) {
            return boom.badData('L\'image ne peut pas faire plus de 2 Mo')
        }
        
        const maxWidth = 690

        try {
            jimp.read(img.path)
                .then( pic => {
                    console.log('read')
                    if (pic.bitmap.width > maxWidth) {
                        pic.resize( maxWidth, jimp.AUTO ) // resizes to maxWidth, auto height
                    }
                    pic.writeAsync(`${pubDir}/profile-pictures/user-${id}.jpg`) // converts to jpg and writes
                })
            console.log('written')
        } 
        catch (err) {
            console.log(err)
            return boom.badData('Une erreur est survenue lors de la manipulation de l\'image')
        }

        return reply.response().code(201)
    }


}