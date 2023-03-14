import {Request, ResponseToolkit} from '@hapi/hapi'
import argon2 from 'argon2'
import boom from '@hapi/boom'
import { UserType } from '../types/classTypes'
import User from '../models/userModel'
import errorDictionnary from '../utils/errorDictionnary'
import Validation from '../utils/validation'


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
        let query = req.query

        let val = new Validation()
        let errors = val.validator(query as UserType, val.userValidation)
        
        /*
        query.password = await argon2.hash(query.password)

        const response = await new User()
            .createUser(query as UserType)
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
        */
       return errors
    }



    public async getUserById (request: Request, h: ResponseToolkit){
        let failed:boolean = false
        let userId = request.params.id
        return 'dbGetUserById(userId)'
    }



    public async updateUser (req: Request, h: ResponseToolkit){
        let returnValue
        let userId = req.params.id
        let query = req.query


        if (query.password != null){
            query.password = await argon2.hash(query.password)
            returnValue = 'dbUpdateUser(userId, query)'
        }

        return returnValue
    }


    public async deleteUser (request: Request, h: ResponseToolkit){
        let failed:boolean = false
        let userId = request.params.id
        return 'dbDeleteUser(userId)'
    }




}