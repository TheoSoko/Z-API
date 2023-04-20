import {Request, ResponseToolkit} from '@hapi/hapi'
import Errors from '../errorHandling/errorDictionary'
import User from '../models/userModel'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { Favorite } from '../types/types'


export default class FavoriteCtrl {

    public async getUserFavorites (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let sub = req.auth.credentials.sub
        console.log(sub)

        let id = req.params?.favoriteId
        if (!id) return Errors.no_id
        
        let favorites =  await new User().fetchFavorites(id)
          .catch(err => Errors[err] || Errors.unidentified)

        return {
            favorites: favorites
        }
    }

    public async getOneFavorite (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let id = req.params?.favoriteId
        if (!id) return Errors.no_id
        
        return await new User().fetchOneFavorite(id)
          .catch(err => Errors[err] || Errors.unidentified)
    }


    public async deleteFavorite (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let id = req.params?.favoriteId
        if (!id) return Errors.no_id
        
        let response = (
            await new User().deleteFavorite(id)
            .then((affectedRows: number) => {
                return (
                    affectedRows > 0 
                    ? "Le favori a été supprimé"
                    : Errors.delete_not_found
                )
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        return response
    }


    public async addFavorite (req: Request, reply: ResponseToolkit) {
        if (req.pre.db == null) return Errors.db_unavailable

        let id = req.params?.id
        if (!id) return Errors.no_id
        if (!req.payload) Errors.no_payload

        let checker = new Checker()
        let errorList: string[] = checker.check(req.payload, ValidationModels.CreateFavorite)
        if (errorList.length > 0){
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: errorList
            })
            .code(422)
        }

        let payload = {...req.payload as object, user_id: id} as Favorite

        let response = (
            await new User().createFavorite(payload)
            .then((newId: number[]) => {
                return {
                    newFavorite: `../favorites/${newId[0]}`
                }
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        return response

    }



    public async getFavoritesForFeed(req: Request){
        return 'Ta gueule'
    }


}

