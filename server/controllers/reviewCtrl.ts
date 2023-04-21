import {Request, ResponseToolkit} from '@hapi/hapi'
import boom from '@hapi/boom'
import Errors from '../errorHandling/errorDictionary'
import Review from '../models/reviewModel'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import { ReviewInput, Article } from '../types/types'


export default class ReviewCtrl {


    public async getUserReviews (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let userId = req.params?.id
        if (!userId) return Errors.no_user_id 
        
        return (
            await new Review().fetchAll(userId)
            .then((reviews) => {
                reviews.map((review) => review.articles = `./reviews/${review.id}`)
                return {
                    reviews: reviews
                }
            })
            .catch(err => Errors[err] || Errors.unidentified)
        )
        
    }


    public async getReviewById (req: Request) {
        if (req.pre.db == null) return Errors.db_unavailable

        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        
        const response = await new Review().fetchOne(reviewId)
        .catch(err => Errors[err] || Errors.unidentified)

        console.log(response)

        return response
    }


    public async deleteReview (req: Request) {

        if (req.pre.db == null) return Errors.db_unavailable

        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        
        let response = (
            await new Review().delete(reviewId)
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
        if (!userId) return Errors.no_user_id
        if (!req.payload) return Errors.no_payload
        
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
        let articleErrors: Array<{index: number, errors: string[]}> = []
        for (const [index, article] of review.articles.entries()){ 
            if (typeof article !== 'object'){
                if (isNaN(article) || !Number.isInteger(article)) {
                    articleErrors.push({index: index, errors: ["Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"]})
                }
                continue;
            }
            let errs = checker.check(article, ValidationModels.ReviewArticle)
            if (errs.length > 0) articleErrors.push({ index: index, errors: errs })
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
 
        let instance = new Review()

        //Création de la revue
        const {articles, ...onlyReview} = review
        let newReviewId = await instance.create(onlyReview, userId).catch(() => null)
        if (newReviewId == null) {
            return boom.badImplementation('crap')
        }

        //Création des articles
        for (const article of review.articles){
            let newArticles = await instance.createArticle(article, newReviewId).catch(() => null)
            if (newArticles == null) return boom.badImplementation('Une erreur est survenue à l\'insertion dans la bdd')
        }
        
        return {
            newReview: `../reviews/${newReviewId}`
        }

    }


    public async createReview (req: Request, reply: ResponseToolkit) {
        if (req.pre.db == null) return Errors.db_unavailable

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

        let review = req.payload as ReviewInput

        //Création de la revue
        let instance = new Review()
        let newReviewId = await instance.create(review, userId).catch(() => null)
        if (newReviewId == null) {
            return boom.badImplementation('crap')
        }
        
        return {
            newReview: `../reviews/${newReviewId}`
        }

    }


    public async postReviewArticles (req: Request, reply: ResponseToolkit) {

        if (req.pre.db == null) return Errors.db_unavailable

        let reviewId = req.params?.reviewId
        if (!reviewId) return Errors.no_ressource_id
        if (!req.payload) return Errors.no_payload

        if (!Array.isArray(req.payload)) return boom.badData('Le corps de la requête doit être un tableau JSON d\'objets "Article" ou de nombre entiers faisant référence à des id de favoris')

        //Vérification des données
        let errorList: Array<{jsonIndex:number, errors:string[]}> = []
        for (const [index, article] of req.payload.entries()){
            if ( typeof article !== 'object' ){
                if (isNaN(article) || !Number.isInteger(article)){
                    // Si l'article n'est ni un objet ni un nombre entier
                    errorList.push({jsonIndex: index, errors: ["Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"]})
                }
                // Si c'est un nombre entier
                continue;
            }
            let checker = new Checker()
            let errsArticle: string[] = checker.check(article, ValidationModels.ReviewArticle)
            if (errsArticle.length > 0) errorList.push({ jsonIndex: index, errors: errsArticle })
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

        for (const article of verifiedArticles){
            let created = await new Review().createArticle(article, reviewId).catch(() => null)
            if (created == null) {
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


    public async removeReviewArticles (req: Request, reply: ResponseToolkit) {

        if (req.pre.db == null) return Errors.db_unavailable

        let reviewId = req.params?.reviewId
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

        const response = (
            await new Review().deleteArticles(idList, reviewId)
                .then((res) => {
                    if (res > 0) return reply.response({affectedRows: res}).code(200)
                    else return boom.notFound('Aucun article correspondant aux id fournis et liés à cette revue n\'ont été trouvés')
                })
                .catch(() => Errors.unidentified)
        )

        return response

    }


    public async updateReview (req: Request, reply: ResponseToolkit) {

        if (req.pre.db == null) return Errors.db_unavailable

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

        let properties = req.payload as Partial<ReviewInput>
        let instance = new Review()
        return await instance.update(reviewId, properties)
            .then(() => 'Les champs ont bien été modifiés')
            .catch(() => Errors.unidentified)

    }





}

