"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorDictionary_1 = __importDefault(require("../errorHandling/errorDictionary"));
const boom_1 = __importDefault(require("@hapi/boom"));
const favoriteModel_1 = __importDefault(require("../models/favoriteModel"));
const validation_1 = __importDefault(require("../errorHandling/validation"));
const validationModels_1 = __importDefault(require("../errorHandling/validationModels"));
class FavoriteCtrl {
    async getUserFavorites(req) {
        var _a;
        let id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return errorDictionary_1.default.no_id;
        let favorites = await new favoriteModel_1.default()
            .fetchAll(id)
            .catch(() => null);
        if (favorites === null)
            return errorDictionary_1.default.unidentified;
        return {
            favorites: favorites
        };
    }
    async getOneFavorite(req) {
        var _a;
        let id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.favoriteId;
        if (!id)
            return errorDictionary_1.default.no_id;
        const result = await new favoriteModel_1.default()
            .fetchOne(id)
            .catch(() => null);
        if (result === null)
            return errorDictionary_1.default.unidentified;
        if (result === undefined)
            return errorDictionary_1.default.not_found_2;
        if (result.user_id != req.auth.credentials.sub)
            return boom_1.default.forbidden('Vous n\'avez pas les autorisations nécessaires pour voir cette ressource');
        return result;
    }
    async deleteFavorite(req, reply) {
        var _a;
        let id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.favoriteId;
        if (!id)
            return errorDictionary_1.default.no_id;
        const favorite = new favoriteModel_1.default();
        const favoriteCheck = await favorite.fetchOne(id).catch(() => null);
        if (favoriteCheck === null)
            return errorDictionary_1.default.unidentified;
        if (favoriteCheck === undefined)
            return errorDictionary_1.default.not_found_2;
        if (favoriteCheck.user_id != req.auth.credentials.sub)
            return boom_1.default.forbidden('Vous n\'avez pas les autorisations nécessaires pour voir cette ressource');
        let result = await favorite
            .delete(id)
            .then((res) => res ? reply.response().code(204) : errorDictionary_1.default.not_found_2)
            .catch(err => null);
        return result;
    }
    async addFavorite(req, reply) {
        var _a;
        let id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return errorDictionary_1.default.no_id;
        if (!req.payload)
            errorDictionary_1.default.no_payload;
        let checker = new validation_1.default();
        let errorList = checker.check(req.payload, validationModels_1.default.CreateFavorite);
        if (errorList.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: errorList
            })
                .code(422);
        }
        let payload = { ...req.payload, user_id: id };
        let response = (await new favoriteModel_1.default().create(payload)
            .then((newId) => {
            return {
                newFavorite: `../favorites/${newId[0]}`
            };
        })
            .catch(err => errorDictionary_1.default[err] || errorDictionary_1.default.unidentified));
        return response;
    }
}
exports.default = FavoriteCtrl;
