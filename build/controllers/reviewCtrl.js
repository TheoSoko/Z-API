"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom_1 = __importDefault(require("@hapi/boom"));
const errorDictionary_1 = __importDefault(require("../errorHandling/errorDictionary"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const validation_1 = __importDefault(require("../errorHandling/validation"));
const validationModels_1 = __importDefault(require("../errorHandling/validationModels"));
const constants_1 = require("../constants/constants");
class ReviewCtrl {
    async getUserReviews(req) {
        var _a, _b;
        let userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return errorDictionary_1.default.no_user_id;
        let mode;
        mode = userId == req.auth.credentials.sub
            ? 'private'
            : Boolean((_b = req.query) === null || _b === void 0 ? void 0 : _b.Friend) // temporaire
                ? 'friends'
                : 'public';
        const results = await new reviewModel_1.default()
            .fetchAll(userId, mode)
            .then((reviews) => {
            reviews.forEach(review => review.articles = `./reviews/${review.id}`);
            return reviews;
        })
            .catch(() => null);
        return (results === null)
            ? errorDictionary_1.default.unidentified
            : { reviews: results };
    }
    async getReviewById(req) {
        var _a, _b;
        let reviewId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId;
        if (!reviewId)
            return errorDictionary_1.default.no_ressource_id;
        let ownedRessource;
        let friend;
        const response = await new reviewModel_1.default()
            .fetchOne(reviewId)
            .catch(() => null);
        if (response === null)
            return errorDictionary_1.default.unidentified;
        if (response === undefined)
            return errorDictionary_1.default.not_found_2;
        ownedRessource = response.user_id == req.auth.credentials.sub;
        friend = Boolean((_b = req.query) === null || _b === void 0 ? void 0 : _b.Friend); // temporaire
        if (response.visibility_id == constants_1.visibility['private']) {
            if (!ownedRessource)
                return boom_1.default.forbidden('Cette ressource est privée');
        }
        if (response.visibility_id == constants_1.visibility['friends']) {
            if (!friend && !ownedRessource)
                return boom_1.default.forbidden('Vous n\'avez pas accès à cette ressource');
        }
        return response;
    }
    async deleteReview(req, reply) {
        var _a;
        let reviewId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId;
        if (!reviewId)
            return errorDictionary_1.default.no_ressource_id;
        let review = new reviewModel_1.default();
        const rev = await review.fetchOne(reviewId);
        if (!rev)
            return errorDictionary_1.default.not_found_2;
        if (rev.user_id != req.auth.credentials.sub)
            return boom_1.default.forbidden('Vous n\'avez pas les autorisations nécessaires pour détruire cette ressource');
        return await review
            .delete(reviewId)
            .then(() => reply.response().code(204))
            .catch(() => errorDictionary_1.default.unidentified);
    }
    async createReviewAndArticles(req, reply) {
        var _a;
        let userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return errorDictionary_1.default.no_user_id;
        if (!req.payload)
            return errorDictionary_1.default.no_payload;
        // On s'assure déjà que la structure générale de l'objet revue est correcte (ValidationModels.CreateReview)
        let checker = new validation_1.default();
        let errorList = checker.check(req.payload, { ...validationModels_1.default.CreateReview, articles: { required: true } });
        if (errorList.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: errorList
            })
                .code(422);
        }
        let reviewInput = req.payload;
        checker.sanitize(reviewInput); // Echappe les données (mais pas les articles)
        if (!Array.isArray(reviewInput.articles)) {
            return boom_1.default.badData('le champs "articles" doit être un tableau');
        }
        let articleErrors = [];
        for (const [index, article] of reviewInput.articles.entries()) {
            if (typeof article !== 'object') {
                if (!isNaN(article) && Number.isInteger(article)) {
                    continue; // Si c'est un nombre, OK
                }
                articleErrors.push({
                    index: index,
                    errors: ["Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"]
                });
                continue;
            }
            let errs = checker.check(article, validationModels_1.default.ReviewArticle);
            if (errs.length > 0)
                articleErrors.push({
                    index: index,
                    errors: errs
                });
            checker.sanitize(article); // Echappe les caractères HTML dans chaque article
        }
        if (articleErrors.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données concernant les articles ont été mal formatées",
                errorList: articleErrors
            })
                .code(422);
        }
        let review = new reviewModel_1.default();
        //Création de la revue
        const { articles, ...onlyReview } = reviewInput;
        let newReviewId = await review.create(onlyReview, userId).catch(() => null);
        if (newReviewId === null) {
            return boom_1.default.badImplementation('crap');
        }
        //Création des articles
        for (const article of reviewInput.articles) {
            let newArticles = await review.createArticle(article, newReviewId).catch(() => null);
            if (newArticles === null)
                return boom_1.default.badImplementation('Une erreur est survenue à l\'insertion dans la bdd');
        }
        return {
            newReview: `../reviews/${newReviewId}`
        };
    }
    async createReview(req, reply) {
        var _a;
        let userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return errorDictionary_1.default.no_user_id;
        if (!req.payload)
            return errorDictionary_1.default.no_payload;
        if (req.payload.articles !== undefined) {
            return boom_1.default.badRequest('Cet endpoint sert à créer une revue sans les articles associés, n\'incluez pas d\'objet "articles" dans ' +
                'le corps de la requête. Pour insérer les articles, veuillez utiliser POST "./reviews/{reviewId}/articles"');
        }
        let checker = new validation_1.default();
        let errorList = checker.check(req.payload, validationModels_1.default.CreateReview);
        if (errorList.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: errorList
            })
                .code(422);
        }
        let reviewInput = req.payload;
        checker.sanitize(reviewInput);
        //Création de la revue
        let review = new reviewModel_1.default();
        let newReviewId = await review.create(reviewInput, userId).catch(() => null);
        if (newReviewId === null) {
            return boom_1.default.badImplementation('crap');
        }
        return {
            newReview: `../reviews/${newReviewId}`
        };
    }
    async postArticles(req, reply) {
        var _a;
        let reviewId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId;
        if (!reviewId)
            return errorDictionary_1.default.no_ressource_id;
        if (!req.payload)
            return errorDictionary_1.default.no_payload;
        if (!Array.isArray(req.payload))
            return boom_1.default.badData('Le corps de la requête doit être un tableau JSON d\'objets "Article" ou de nombre entiers faisant référence à des id de favoris');
        let checker = new validation_1.default();
        // Chaque article doit être :
        // - ou un objet valide (ValidationModels.ReviewArticle) 
        // - ou un entier (un id de favoris)
        let errorList = [];
        for (const [index, article] of req.payload.entries()) {
            if (typeof article !== 'object') {
                if (!isNaN(article) && Number.isInteger(article)) {
                    continue; // Si nombre entier, OK
                }
                errorList.push({
                    jsonIndex: index,
                    errors: ["Chaque article doit être soit un nombre entier faisant référence à un id de favoris, soit un objet Article"]
                });
            }
            let errsArticle = checker.check(article, validationModels_1.default.ReviewArticle);
            if (errsArticle.length > 0)
                errorList.push({
                    jsonIndex: index,
                    errors: errsArticle
                });
        }
        if (errorList.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données concernant les articles ont été mal formatées",
                errorList: errorList
            })
                .code(422);
        }
        let verifiedArticles = req.payload;
        //Checking credentials
        const review = new reviewModel_1.default();
        const checkReview = await review.fetchOneBasic(reviewId);
        if (!checkReview)
            return errorDictionary_1.default.not_found_2;
        if (checkReview.user_id != req.auth.credentials.sub)
            return boom_1.default.forbidden('Vous n\'avez pas les autorisations nécessaires pour manipuler cette ressource');
        for (const article of verifiedArticles) {
            if (typeof article == "object") {
                checker.sanitize(article); // Echappe les caractères HTML dans chaque valeur de l'objet article
            }
            let created = await review.createArticle(article, reviewId).catch(() => null);
            if (created === null) {
                return reply.response({
                    statusCode: 500,
                    error: "Internal Server Error",
                    message: `Désolé, une erreur est survenue à l'insertion de l'article numero ${verifiedArticles.indexOf(article) + 1}`
                })
                    .code(500);
            }
        }
        return reply.response({
            message: 'Les articles ont bien été ajoutés à la revue',
            review: `./reviews/${reviewId}`
        })
            .code(201);
    }
    async removeArticles(req, reply) {
        var _a, _b, _c;
        let reviewId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId;
        if (!reviewId)
            return errorDictionary_1.default.no_ressource_id;
        if (!((_b = req.query) === null || _b === void 0 ? void 0 : _b.id))
            return errorDictionary_1.default.delete_no_query;
        let idList = ((_c = req.query) === null || _c === void 0 ? void 0 : _c.id.split(','));
        let idArray = [];
        idList
            .forEach((id) => {
            if (isNaN(parseFloat(id)) || !Number.isInteger(parseFloat(id))) {
                return boom_1.default.badRequest('Veuillez fournir les id (nombres entiers) des articles à retirer de la revue, en params de query, comme ceci: ?id=1,2,3');
            }
            else
                idArray.push(parseInt(id));
        });
        const review = new reviewModel_1.default();
        const checkReview = await review.fetchOneBasic(reviewId);
        if (!checkReview)
            return errorDictionary_1.default.not_found_2;
        if (checkReview.user_id != req.auth.credentials.sub) {
            return boom_1.default.forbidden('Vous n\'avez pas les autorisations nécessaires pour manipuler cette ressource');
        }
        return (await review.deleteArticles(idList, reviewId)
            .then((res) => {
            if (res > 0)
                return reply.response({ affectedRows: res }).code(200);
            else
                return boom_1.default.notFound('Aucun article correspondant aux id fournis et liés à cette revue n\'ont été trouvés');
        })
            .catch(() => errorDictionary_1.default.unidentified));
    }
    async updateReview(req, reply) {
        var _a;
        let reviewId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.reviewId;
        if (!reviewId)
            return errorDictionary_1.default.no_ressource_id;
        if (!req.payload)
            return errorDictionary_1.default.no_payload;
        let checker = new validation_1.default();
        let errs = checker.check(req.payload, validationModels_1.default.updateReview);
        if (errs.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données concernant les articles ont été mal formatées",
                errorList: errs
            })
                .code(422);
        }
        let instance = new reviewModel_1.default();
        let properties = req.payload;
        checker.sanitize(properties); // Echappe les données
        const reviewCheck = await instance.fetchOneBasic(reviewId);
        if (!reviewCheck)
            return errorDictionary_1.default.not_found_2;
        if (reviewCheck.user_id != req.auth.credentials.sub) {
            return boom_1.default.forbidden('Vous n\'avez pas les autorisations nécessaires pour manipuler cette ressource');
        }
        return await instance.update(reviewId, properties)
            .then(() => reply.response().code(204))
            .catch(() => errorDictionary_1.default.unidentified);
    }
}
exports.default = ReviewCtrl;
