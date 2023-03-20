import {Request, ResponseToolkit} from '@hapi/hapi'
import argon2 from 'argon2'
import boom from '@hapi/boom'
import { UserType } from '../types/queryTypes'
import { UnkownIterable } from '../types/types'
import User from '../models/userModel'
import errorDictionnary from '../utils/errorDictionnary'
import Validation from '../utils/validation'
import ValidationModels from '../utils/validationModels'

export default class userCtrl {


    public async userSignIn (request: Request, h: ResponseToolkit){
        let returnValue
        let query = request.query

        if (!query.email || !query.password){
            returnValue = h.response().code(400)
        }

        let userInfo = 'dbFetchUser(query.email, query.password)'

        /*
        if (await argon2.verify(userInfo.password, query.password)){
            returnValue = userInfo
        }
        */

        return returnValue
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
        let previous:number|void = await user.fetchUserByEmail((payload as UserType).email).then(res => res)
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
        let id = request.params.id
        let user = new User()
        return await user.fetchUser(id)
                .then((result) => result)
                .catch((err: {code: string}) => {
                    return errorDictionnary[err.code] || errorDictionnary.unidentified
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
                .catch(() => errorDictionnary.unidentified)
    }




}