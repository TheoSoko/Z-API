import {Request, ResponseToolkit} from '@hapi/hapi'
import boom from '@hapi/boom'
import Errors from '../errorHandling/errorDictionary'
import Review from '../models/reviewModel'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { ReviewInput, Article } from '../types/types'
import { visibility } from '../constants/constants'


export default class ReviewCtrl {


    public async getUserReviews (req: Request) {
        
        let userId = req.params?.userId
        if (!userId) return Errors.no_user_id

        let mode: 'private' | 'friends' | 'public'
        mode = userId == req.auth.credentials.sub
            ? 'private'
            : Boolean(req.query?.Friend) // temporaire
                ? 'friends'
                : 'public'

        const results = await new Review()
            .fetchAll(userId, mode)
            .then((reviews) => {
                reviews.forEach(review => review.articles = `./reviews/${review.id}`)
                return reviews
            })
            .catch(() => null)
        
        return (results === null)
            ? Errors.unidentified
            : { reviews: results }
    }


    public async getReviewById (req: Request) {
        
        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        let ownedRessource: boolean
        let friend: boolean

        const response = await new Review()
            .fetchOne(reviewId)
            .catch(() => null)

        if (response === null) return Errors.unidentified
        if (response === undefined) return Errors.not_found_2

        ownedRessource = response.user_id == req.auth.credentials.sub
        friend = Boolean(req.query?.Friend) // temporaire

        if (response.visibility_id == visibility['private']) {
            if (!ownedRessource) return boom.forbidden('Cette ressource est privée')
        }
        if (response.visibility_id == visibility['friends']) {
            if (!friend && !ownedRessource) return boom.forbidden('Vous n\'avez pas accès à cette ressource')
        }

        return response
    }


    public async deleteReview (req: Request, reply: ResponseToolkit) {
        
        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        
        let review = new Review()
        const rev = await review.fetchOne(reviewId)
        if (!rev) return Errors.not_found_2
        
        if (rev.user_id != req.auth.credentials.sub) return boom.forbidden('Vous n\'avez pas les autorisations nécessaires pour détruire cette ressource')

        return await review
            .delete(reviewId)
            .then(() => reply.response().code(204))
            .catch(() => Errors.unidentified)
    }




    public async createReviewAndArticles (req: Request, reply: ResponseToolkit) {

        
        let userId = req.params?.id
        if (!userId) return Errors.no_user_id
        if (!req.payload) return Errors.no_payload
        
        // On s'assure déjà que la structure générale de l'objet revue est correcte (ValidationModels.CreateReview)
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

        let reviewInput = req.payload as ReviewInput
        
        if (!Array.isArray(reviewInput.articles)){
            return boom.badData('le champs "articles" doit être un tableau')
        }

        // Chaque article doit être un objet valide (ValidationModels.ReviewArticle) ou un entier (un id de favoris)
        type error = {
            index: number, 
            errors: string[]
        }
        let articleErrors: error[] = []
        for (const [index, article] of reviewInput.articles.entries()){
            if (typeof article !== 'object'){
                if (!isNaN(article) && Number.isInteger(article)) {
                    continue;
                }
                articleErrors.push({
                    index: index,
                    errors: ["Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"]
                })
            }
            let errs = checker.check(article, ValidationModels.ReviewArticle)
            if (errs.length > 0) articleErrors.push({
                index: index,
                errors: errs
            })
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
 
        let review = new Review()

        //Création de la revue
        const {articles, ...onlyReview} = reviewInput
        let newReviewId = await review.create(onlyReview, userId).catch(() => null)
        if (newReviewId === null) {
            return boom.badImplementation('crap')
        }

        //Création des articles
        for (const article of reviewInput.articles){
            let newArticles = await review.createArticle(article, newReviewId).catch(() => null)
            if (newArticles === null) return boom.badImplementation('Une erreur est survenue à l\'insertion dans la bdd')
        }
        
        return {
            newReview: `../reviews/${newReviewId}`
        }

    }


    public async createReview (req: Request, reply: ResponseToolkit) {
        
        let userId = req.params?.id
        if (!userId) return Errors.no_user_id
        if (!req.payload) return Errors.no_payload
        
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

        let reviewInput = req.payload as ReviewInput

        //Création de la revue
        let review = new Review()
        let newReviewId = await review.create(reviewInput, userId).catch(() => null)
        if (newReviewId === null) {
            return boom.badImplementation('crap')
        }
        
        return {
            newReview: `../reviews/${newReviewId}`
        }

    }


    public async postArticles (req: Request, reply: ResponseToolkit) {

        
        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        if (!req.payload) return Errors.no_payload

        if (!Array.isArray(req.payload)) return boom.badData('Le corps de la requête doit être un tableau JSON d\'objets "Article" ou de nombre entiers faisant référence à des id de favoris')

        // Chaque article doit être :
        // - ou un objet valide (ValidationModels.ReviewArticle) 
        // - ou un entier (un id de favoris)
        let errorList: Array<{jsonIndex:number, errors:string[]}> = []
        for (const [index, article] of req.payload.entries()){
            if (typeof article !== 'object'){
                if (!isNaN(article) && Number.isInteger(article)) {
                    continue; // Si c'est un entier
                }
                errorList.push({
                    jsonIndex: index,
                    errors: ["Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"]
                })
            }
            let checker = new Checker()
            let errsArticle: string[] = checker.check(article, ValidationModels.ReviewArticle)
            if (errsArticle.length > 0) errorList.push({ 
                jsonIndex: index, 
                errors: errsArticle 
            })
        }
        if (errorList.length > 0){
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données concernant les articles ont été mal formatées",
                errorList: errorList
            })
            .code(422)
        }

        let verifiedArticles = req.payload as (Article|number)[]

        //Checking credentials
        const review = new Review()
        const checkReview = await review.fetchOneBasic(reviewId)
        if (!checkReview) return Errors.not_found_2
        if (checkReview.user_id != req.auth.credentials.sub) return boom.forbidden('Vous n\'avez pas les autorisations nécessaires pour manipuler cette ressource')

        for (const article of verifiedArticles){
            let created = await review.createArticle(article, reviewId).catch(() => null)
            if (created === null) {
                return reply.response({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message: `Désolé, une erreur est survenue à l'insertion de l'article numero ${verifiedArticles.indexOf(article) + 1}`
                })
                .code(500)
            }
        }

        return reply.response({
            message: 'Les articles ont bien été ajoutés à la revue',
            review: `./reviews/${reviewId}`
        })
        .code(201)

    }


    public async removeArticles (req: Request, reply: ResponseToolkit) {
        
        let reviewId: number = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        if (!req.query?.id) return Errors.delete_no_query

        let idList = (req.query?.id.split(','))
        let idArray: number[] = []
        idList
        .forEach((id: string) => {
            if (isNaN(parseFloat(id)) || !Number.isInteger(parseFloat(id))) {
                return boom.badRequest('Veuillez fournir les id (nombres entiers) des articles à retirer de la revue, en params de query, comme ceci: ?id=1,2,3')
            }
            else idArray.push(parseInt(id))
        })

        const review = new Review()
        const checkReview = await review.fetchOneBasic(reviewId)
        if (!checkReview) return Errors.not_found_2
        if (checkReview.user_id != req.auth.credentials.sub){
            return boom.forbidden('Vous n\'avez pas les autorisations nécessaires pour manipuler cette ressource')
        }

        return  (
            await review.deleteArticles(idList, reviewId)
                .then((res: number) => {
                    if (res > 0) return reply.response({affectedRows: res}).code(200)
                    else return boom.notFound('Aucun article correspondant aux id fournis et liés à cette revue n\'ont été trouvés')
                })
                .catch(() => Errors.unidentified)
        )
    }


    public async updateReview (req: Request, reply: ResponseToolkit) {
        
        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        if (!req.payload) return Errors.no_payload

        let checker = new Checker()
        let errs = checker.check(req.payload, ValidationModels.updateReview)
        if (errs.length > 0){
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données concernant les articles ont été mal formatées",
                errorList: errs
            })
            .code(422)
        }

        let instance = new Review()
        let properties = req.payload as Partial<ReviewInput>

        const reviewCheck = await instance.fetchOneBasic(reviewId)
        if (!reviewCheck) return Errors.not_found_2
        if (reviewCheck.user_id != req.auth.credentials.sub){
            return boom.forbidden('Vous n\'avez pas les autorisations nécessaires pour manipuler cette ressource')
        }

        return await instance.update(reviewId, properties)
            .then(() => reply.response().code(204))
            .catch(() => Errors.unidentified)
    }





}

