"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom_1 = __importDefault(require("@hapi/boom"));
const friendModel_1 = __importDefault(require("../models/friendModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const errorDictionary_1 = __importDefault(require("../errorHandling/errorDictionary"));
class FriendCtrl {
    async getAllFriends(req) {
        var _a;
        const senderId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!senderId)
            return errorDictionary_1.default.no_id;
        const friend = new friendModel_1.default();
        const user = new userModel_1.default();
        const friendships = await friend.fetchAll(senderId)
            .catch(() => { throw errorDictionary_1.default.unidentified; });
        const friendList = [];
        for (const fr of friendships) {
            let friendId = (senderId == fr.user1_id)
                ? fr.user2_id
                : fr.user1_id;
            const friendUser = await user.fetch(friendId);
            friendList.push({
                ...friendUser, since: fr.date
            });
        }
        return friendList;
    }
    async friendRequest(req, reply) {
        var _a, _b;
        const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        const friendId = (_b = req.params) === null || _b === void 0 ? void 0 : _b.friendId;
        if (!id || !friendId)
            return errorDictionary_1.default.no_id_friends;
        const friend = new friendModel_1.default();
        const friendship = await friend.fetchFriendship(id, friendId);
        //Si déjà amis : 409 Conflict
        if ((friendship === null || friendship === void 0 ? void 0 : friendship.confirmed) == 1) {
            return errorDictionary_1.default.already_friends;
        }
        //Si demande déjà envoyée par l'autre utilisateur : accepte la demande
        if (id == (friendship === null || friendship === void 0 ? void 0 : friendship.user2_id)) {
            return await friend.accept(id, friendId)
                .then(() => {
                return {
                    message: 'Demande d\'ami acceptée',
                    newFriend: `./users/${id}/friends/${friendId}`
                };
            })
                .catch((err) => {
                return errorDictionary_1.default[err.code] || errorDictionary_1.default.unidentified;
            });
        }
        //Si demande déjà envoyée : 409 Conflict
        if (friendship !== undefined) {
            return errorDictionary_1.default.already_sent_invitation; // demande déjà envoyée
        }
        //Sinon, crée nouvelle demande
        return (await friend.add(id, friendId)
            .then(() => {
            return reply.response({ newFriendship: `./users/${id}/friends/${friendId}` }).code(201);
        })
            .catch((err) => {
            return errorDictionary_1.default[err.code] || errorDictionary_1.default.unidentified;
        }));
    }
    async getFriendship(req) {
        var _a, _b;
        const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        const friendId = (_b = req.params) === null || _b === void 0 ? void 0 : _b.friendId;
        if (!id || !friendId) {
            return errorDictionary_1.default.no_id_friends;
        }
        const friend = new friendModel_1.default();
        return await friend.fetchFriendship(id, friendId)
            .then(friendship => friendship !== null && friendship !== void 0 ? friendship : boom_1.default.notFound())
            .catch((err) => {
            return errorDictionary_1.default[err.code] || errorDictionary_1.default.unidentified;
        });
    }
    async unfriend(req) {
        var _a, _b;
        const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        const friendId = (_b = req.params) === null || _b === void 0 ? void 0 : _b.friendId;
        if (!id || !friendId) {
            return errorDictionary_1.default.no_id_friends;
        }
        let response = await new friendModel_1.default().remove(id, friendId);
        return { affectedRows: response };
    }
    async getInvitations(req, h) {
        var _a;
        const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!id) {
            return errorDictionary_1.default.no_id;
        }
        let response = await new friendModel_1.default().fetchInvitations(id);
        return h.response({ friend_requests: response }).code(200);
    }
}
exports.default = FriendCtrl;
