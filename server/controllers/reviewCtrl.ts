import {Request, ResponseToolkit} from '@hapi/hapi'
import Errors from '../errorHandling/errorDictionary'
import User from '../models/userModel'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { Favorite } from '../types/types'


export default class ReviewCtrl {


    public async getUserReviews (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let userId = req.params?.id
        if (!userId) return Errors.no_id
        
        return (
            await new User().fetchReviews(userId)
            .then((reviews) => {
                return {
                    reviews: reviews
                }
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        
    }


    public async getReviewById (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let id = req.params?.reviewId
        if (!id) return Errors.no_id
        
        const response = await new User().fetchOneReview(id)
        .catch(err => Errors[err] || Errors.unidentified)

        console.log(response)

        return response
    }


    public async deleteReview (req: Request) {
/*
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
*/
    }




    public async createReview (req: Request, reply: ResponseToolkit) {
/*
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
            .then((newId: number) => {
                return {newFavorite: `../favorites/${newId}`}
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        return response
*/
    }


    public async updateReview (req: Request) {

    }


}

