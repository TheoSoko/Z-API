"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const friendModel_1 = __importDefault(require("../models/friendModel"));
const argon2_1 = __importDefault(require("argon2"));
const boom_1 = __importDefault(require("@hapi/boom"));
const server_1 = require("../server");
const jimp_1 = __importDefault(require("jimp"));
const errorDictionary_1 = __importDefault(require("../errorHandling/errorDictionary"));
const validation_1 = __importDefault(require("../errorHandling/validation"));
const validationModels_1 = __importDefault(require("../errorHandling/validationModels"));
const auth_1 = require("../middlewares/auth");
class UserCtrl {
    async userSignIn(request, reply) {
        if (request.pre.db == null)
            return errorDictionary_1.default.db_unavailable;
        //let query = knex.raw('SELECT `id`, `password`, `lastname`, `firstname`, `email`, `profile_picture`, `country` from users')
        let payload = request.payload;
        if (!payload)
            return errorDictionary_1.default.no_payload;
        if (!payload.email || !payload.password)
            return boom_1.default.badRequest('Veuillez fournir une adresse email et un mot de passe');
        let user = new userModel_1.default();
        let userInfo = await user.fetchByEmail(payload.email).catch(() => null); // Si erreur, renvoie null
        if (userInfo === null)
            return errorDictionary_1.default.unidentified;
        if (userInfo === undefined || (!await argon2_1.default.verify(userInfo.password, payload.password))) {
            return boom_1.default.unauthorized('Adresse email ou mot de passe incorrect');
        }
        userInfo.password = '';
        const token = (0, auth_1.generateToken)(userInfo.id, payload.email);
        return (reply.response({
            user: userInfo,
            token: token
        })
            .code(201));
    }
    async createUser(request, reply) {
        if (request.pre.db == null)
            return errorDictionary_1.default.db_unavailable;
        let payload = request.payload;
        if (!payload)
            return errorDictionary_1.default.no_payload;
        let checker = new validation_1.default();
        let err = checker.check(payload, validationModels_1.default.CreateUser);
        if (err.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: err
            })
                .code(422);
        }
        let user = new userModel_1.default();
        let previous = await user.fetchByEmail(payload.email, 'idOnly');
        if (previous) {
            return errorDictionary_1.default.existing_user;
        }
        payload.password = await argon2_1.default.hash(payload.password);
        try {
            const newUser = await user.create(payload);
            return (reply.response({
                id: newUser,
                newRessource: `./users/${newUser}`
            })
                .code(201));
        }
        catch (error) {
            const err = error;
            return errorDictionary_1.default[err.code] || errorDictionary_1.default.unidentified;
        }
    }
    async getUserById(request) {
        var _a;
        if (request.pre.db == null)
            return errorDictionary_1.default.db_unavailable;
        let id = (_a = request.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!id) {
            return errorDictionary_1.default.no_id;
        }
        return await new userModel_1.default().fetch(id)
            .catch(() => errorDictionary_1.default.unidentified);
    }
    async updateUser(request, reply) {
        if (request.pre.db == null)
            return errorDictionary_1.default.db_unavailable;
        let payload = request.payload;
        let userId = request.params.id;
        if (!userId)
            return errorDictionary_1.default.no_id;
        if (!payload)
            return errorDictionary_1.default.no_payload;
        let checker = new validation_1.default();
        let err = checker.check(payload, validationModels_1.default.UpdateUser);
        if (err.length > 0) {
            return reply.response({
                statusCode: 422,
                error: "Unprocessable Entity",
                message: "Les données envoyées dans le corps de la requêtes ont été mal formatées",
                errorList: err
            })
                .code(422);
        }
        if (payload.password != null) {
            payload.password = await argon2_1.default.hash(payload.password);
        }
        try {
            let updated = await new userModel_1.default().update(userId, payload);
            return reply.response({ updatedRows: updated }).code(200);
        }
        catch (error) {
            const err = error;
            return errorDictionary_1.default[err.code] || errorDictionary_1.default.unidentified;
        }
    }
    async deleteUser(request) {
        if (request.pre.db == null)
            return errorDictionary_1.default.db_unavailable;
        let id = request.params.id;
        if (!parseInt(id)) {
            return boom_1.default.badRequest();
        }
        let response = await new userModel_1.default().delete(id);
        return { affectedRows: response };
    }
    async getFeed(request) {
        var _a, _b, _c;
        if (request.pre.db == null)
            return errorDictionary_1.default.db_unavailable;
        let id = (_a = request.params) === null || _a === void 0 ? void 0 : _a.id;
        let page = (_c = (_b = request.query) === null || _b === void 0 ? void 0 : _b.page) !== null && _c !== void 0 ? _c : '1';
        if (!id)
            return errorDictionary_1.default.no_user_id;
        if (isNaN(page)) {
            return boom_1.default.badRequest('Veuillez fournir un numéro de page valide (e.g ?page=69)');
        }
        let user = new userModel_1.default();
        let friend = new friendModel_1.default();
        const friendShips = await friend.fetchAll(id).catch(() => null); // renvoie null si erreur
        if (friendShips == null)
            return errorDictionary_1.default.unidentified;
        const friendIds = [];
        const friends = [];
        for (const fr of friendShips) {
            let friendId = (id == fr.user1_id)
                ? fr.user2_id
                : fr.user1_id;
            friendIds.push(friendId);
            //
            let friendInfo = await user.fetch(friendId, 'basicInfo');
            if (friendInfo)
                friends.push(friendInfo);
        }
        const feed = await user.fetchFeed(friendIds, parseInt(page)).catch(() => null);
        if (feed == null) {
            return errorDictionary_1.default.unidentified;
        }
        feed.forEach((review) => {
            for (const friend of friends) {
                if (review.user_id == friend.id) {
                    review.owner = friend;
                }
            }
        });
        return feed;
    }
    async getProfilePic(request, reply) {
        var _a;
        let id = (_a = request.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return errorDictionary_1.default.no_user_id;
        return reply.file(`profile-pictures/user-${id}.jpg`);
    }
    async setProfilePic(request, reply) {
        var _a;
        let id = (_a = request.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!id)
            return errorDictionary_1.default.no_user_id;
        let maxBytes = 2000000;
        let img = request.payload;
        if (img.bytes > maxBytes)
            return boom_1.default.badData('L\'image ne peut pas faire plus de 2 Mo');
        const maxWidth = 690;
        try {
            jimp_1.default.read(img.path)
                .then(pic => {
                console.log('read');
                if (pic.bitmap.width > maxWidth) {
                    pic.resize(maxWidth, jimp_1.default.AUTO); // resizes to maxWidth, auto height
                }
                pic.writeAsync(`${server_1.pubDir}/profile-pictures/user-${id}.jpg`); // converts to jpg and writes
            });
            console.log('written');
        }
        catch (err) {
            console.log(err);
            return boom_1.default.badData('Une erreur est survenue lors de la manipulation de l\'image');
        }
        return reply.response().code(201);
    }
}
exports.default = UserCtrl;