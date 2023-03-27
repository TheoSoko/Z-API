import {Request, ResponseToolkit} from '@hapi/hapi'
import argon2 from 'argon2'
import boom from '@hapi/boom'
import { UserType } from '../types/queryTypes'
import { UnkownIterable } from '../types/types'
import User from '../models/userModel'
import errorDictionnary from '../utils/errorDictionnary'
import Validation from '../utils/validation'
import ValidationModels from '../utils/validationModels'
import Jwt from '@hapi/jwt'

export default class UserCtrl {


    public async userSignIn (request: Request, h: ResponseToolkit){
        let payload = request.payload as UserType
        if (!payload){
            return errorDictionnary.noPayload
        }
        if (!payload.email || !payload.password){
            return boom.badRequest('Veuillez fournir une adresse email et un mot de passe')
        }
        let user = new User()
        let userInfo = await user.fetchUserByEmail(payload.email).then(res => res).catch(() => null)
        if (userInfo === null){
            return errorDictionnary.serverError
        }
        let checkPassword = !userInfo ? false : await argon2.verify(userInfo.password!, payload.password) 
        if (!checkPassword){
            return boom.unauthorized('Adresse email ou mot de passe incorrect')
        }

        delete userInfo!.password
        
        const token = Jwt.token.generate({
            iss: 'api.zemus.info',
            aud: 'api.zemus.info',
            sub: String(userInfo!.id),
            userEmail: payload.email,
        }, 'Coffee Pot')

        return {
            user: userInfo,
            token: token
        }
    }


    public async createUser (req: Request, h: ResponseToolkit){
        let payload = req.payload as UnkownIterable
        if (!payload){
            return errorDictionnary.noPayload
        }
        let val = new Validation()
        let errors = val.validator(payload , ValidationModels.createUser)
        if (errors.length > 0){
            return errors
        }

        let user = new User()
        let previous = await user.fetchUserByEmail((payload as UserType).email, true).then(res => res)
        if (previous){
            return errorDictionnary.existingUser
        }
        
        payload.password = await argon2.hash((payload as UserType).password)

        const response = await user
            .createUser(payload as UserType)
            .then(result => {
                return {
                    id: result,
                    newRessource: `../users/${result}`
                }
            })
            .catch((err: {code: string}) => {
                return errorDictionnary[err.code] || errorDictionnary.unidentified
            })

        return response
    }


    public async getUserById (request: Request, h: ResponseToolkit){
        let id = request.params?.id
        if (!id){
            return errorDictionnary.noId
        }
        let user = new User()
        return await user.fetchUser(id)
                .then((result) => result)
                .catch((err: {code: string}) => {
                    return errorDictionnary[err.code] || errorDictionnary.serverError
                })
    }


    public async updateUser (req: Request, h: ResponseToolkit){
        let payload = req.payload as UnkownIterable
        let userId = req.params.id

        let val = new Validation()
        let errors = val.validator(payload , ValidationModels.updateUser)
        if (errors.length > 0){
            return errors
        }

        if (payload.password != null){
            payload.password = await argon2.hash((payload as UserType).password)
        }

       let user = new User()
       return user.updateUser(userId, payload)
            .then((res:number) => {
                return {affectedRows: res}
            })
            .catch((err: {code: string}) => {
                return errorDictionnary[err.code] || errorDictionnary.unidentified
            })
    }


    public async deleteUser (request: Request, h: ResponseToolkit){
        let id = request.params.id
        if (!parseInt(id)){
            return boom.badRequest()
        }
        let user = new User()
        return user.deleteUser(id)
                .then((res:number) => {
                    return {
                        affectedRows: res
                    }
                })
                .catch(() => errorDictionnary.serverError)
    }




}