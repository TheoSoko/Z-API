import {Request, ResponseToolkit} from '@hapi/hapi'
import argon2 from 'argon2'
import { userProperties } from '../basicObjects/basicObjects'
import { UserProperties } from '../types/types'

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


    public async createUser (request: Request, h: ResponseToolkit){
        let returnValue
        let failed:boolean = false
        let query = request.query

        //vérifie qu'il y a tous les params nécessaires
        //Ne récupère que les params qui correspondent
        for (const key in userProperties){
            if (query.hasOwnProperty(key)){
                userProperties[key as keyof UserProperties] = query[key]
            } else {
                returnValue = h.response('Toutes les informations nécessaires n\'ont pas été fournies').code(400)
                failed = true
                break
            }
        }

        /** MANQUE LA VALIDATION ICI **/


        if (!failed){
            userProperties.password = await argon2.hash(query.password)
            returnValue = 'dbCreateUser()'
        }

        return returnValue
    }


    public async getUserById (request: Request, h: ResponseToolkit){
        let failed:boolean = false
        let userId = request.params.id
        return 'dbGetUserById(userId)'
    }

    
    public async updateUser (request: Request, h: ResponseToolkit){
        let returnValue
        let query = request.query
        let userId = request.params.id

        //Ne récupère que les params qui correspondent
        for (const key in userProperties){
            if (query.hasOwnProperty(key)){
                userProperties[key as keyof UserProperties] = query[key]
            }
        }

        /** MANQUE LA VALIDATION ICI **/
 

        if (query.password != null){
            userProperties.password = await argon2.hash(query.password)
            returnValue = 'dbUpdateUser(userId, userProperties)'
        }

        return returnValue
    }



    public async deleteUser (request: Request, h: ResponseToolkit){
        let failed:boolean = false
        let userId = request.params.id
        return 'dbDeleteUser(userId)'
    }




}