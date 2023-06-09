import {Request, ResponseToolkit} from '@hapi/hapi'
import Errors from '../errorHandling/errorDictionary'
import boom from '@hapi/boom'
import Favorite from '../models/favoriteModel'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { Favorite as Fav } from '../types/types'


export default class FavoriteCtrl {

    public async getUserFavorites (req: Request) {
        
        let id = req.params?.id
        if (!id) return Errors.no_id
        
        let favorites =  await new Favorite()
            .fetchAll(id)
            .catch(() => null)
        if (favorites === null) return Errors.unidentified
        
        return {
            favorites: favorites
        }
    }

    public async getOneFavorite (req: Request) {
        
        let id = req.params?.favoriteId
        if (!id) return Errors.no_id
        
        const result = await new Favorite()
            .fetchOne(id)
            .catch(() => null)

        if (result === null) return Errors.unidentified
        if (result === undefined) return Errors.not_found_2
        if (result.user_id != req.auth.credentials.sub) return boom.forbidden('Vous n\'avez pas les autorisations nécessaires pour voir cette ressource')
        
        return result
    }


    public async deleteFavorite (req: Request, reply: ResponseToolkit) {
        
        let id = req.params?.favoriteId
        if (!id) return Errors.no_id
        
        const favorite = new Favorite()

        const favoriteCheck = await favorite.fetchOne(id).catch(() => null)
        if (favoriteCheck === null) return Errors.unidentified
        if (favoriteCheck === undefined) return Errors.not_found_2
        if (favoriteCheck.user_id != req.auth.credentials.sub) return boom.forbidden('Vous n\'avez pas les autorisations nécessaires pour voir cette ressource')

        let result = await favorite
            .delete(id)
            .then((res) => res ? reply.response().code(204) : Errors.not_found_2)
            .catch(err => null)
    
        return result
    }


    public async addFavorite (req: Request, reply: ResponseToolkit) {
        
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

        let payload = {...req.payload as object, user_id: id} as Fav

        let response = (
            await new Favorite().create(payload)
            .then((newId: number[]) => {
                return {
                    newFavorite: `../favorites/${newId[0]}`
                }
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        return response

    }

}

