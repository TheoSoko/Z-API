import {Request, ResponseToolkit} from '@hapi/hapi'
import boom from '@hapi/boom'
import Errors from '../errorHandling/errorDictionary'
import User from '../models/userModel'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { Favorite, ReviewInput } from '../types/types'


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

        if (req.pre.db == null) return Errors.db_unavailable

        let id = req.params?.reviewId
        if (!id) return Errors.no_id
        
        let response = (
            await new User().deleteReview(id)
            .then((affectedRows: number) => {
                return (
                    affectedRows > 0 
                    ? "La revue a été supprimée"
                    : Errors.delete_not_found
                )
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        return response

    }




    public async createReviewAndArticles (req: Request, reply: ResponseToolkit) {

        if (req.pre.db == null) return Errors.db_unavailable

        let userId = req.params?.id
        if (!userId) return Errors.no_id
        if (!req.payload) Errors.no_payload
        
        // On s'assure déjà que la structure générale est correcte (ValidationModels.CreateReview)
        let checker = new Checker()
        let errorList: string[] = checker.check(req.payload, { ...ValidationModels.CreateReview, articles: {required: true} })
        if (errorList.length > 0){
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: errorList
            })
            .code(422)
        }

        let review = req.payload as ReviewInput
        if (!Array.isArray(review.articles)){
            return boom.badData('le champs "articles" doit être un tableau')
        }

        // Vérification de la validité de chaque article (ValidationModels.ReviewArticle) || isInteger
        let articleErrors: { index: number, errors: string[]|string }[] = []
        for (const article of review.articles){
            if (typeof article !== 'object'){
                if (isNaN(article) || !Number.isInteger(article)) {
                    articleErrors.push({index: review.articles.indexOf(article), errors: "Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"})
                }
                continue;
            }
            let errs = checker.check(article, ValidationModels.ReviewArticle)
            if (errs.length > 0) articleErrors.push({index: review.articles.indexOf(article), errors: errs})
        }

        if (articleErrors.length > 0){
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données concernant les articles ont été mal formatées",
                errorList: articleErrors
            })
            .code(422)
        }
 
        let user = new User()

        //Création de la revue
        const {articles, ...onlyReview} = review
        let newReviewId = await user.createReview(onlyReview, userId).catch(() => null)
        if (newReviewId == null) {
            return boom.badImplementation('crap')
        }

        //Création des articles
        for (const article of review.articles){
            let newArticles = await user.createArticle(article, newReviewId).catch(() => null)
            if (newArticles == null) return boom.badImplementation('Une erreur est survenue à l\'insertion dans la bdd')
        }
        
        return {
            newReview: `../reviews/${newReviewId}`
        }

    }


    public async createReview (req: Request, reply: ResponseToolkit) {
        if (req.pre.db == null) return Errors.db_unavailable

        let userId = req.params?.id
        if (!userId) return Errors.no_id
        if (!req.payload) Errors.no_payload
        
        if ((req.payload as ReviewInput).articles !== undefined){
            return boom.badRequest('Cet endpoint sert à créer une revue sans les articles associés, n\'incluez pas d\'objet "articles" dans ' +
                                   'le corps de la requête. Pour insérer les articles, veuillez utiliser POST "./reviews/{reviewId}/articles"')
        }

        let checker = new Checker()
        let errorList: string[] = checker.check(req.payload, ValidationModels.CreateReview)
        if (errorList.length > 0){
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: errorList
            })
            .code(422)
        }

        let review = req.payload as ReviewInput

        //Création de la revue
        let user = new User()
        let newReviewId = await user.createReview(review, userId).catch(() => null)
        if (newReviewId == null) {
            return boom.badImplementation('crap')
        }
        
        return {
            newReview: `../reviews/${newReviewId}`
        }

    }


    public async updateReview (req: Request) {

    }


}

