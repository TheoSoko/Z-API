"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const errorDictionary_1 = __importDefault(require("../errorHandling/errorDictionary"));
const validator_1 = __importDefault(require("validator"));
class MessageController {
    async getMessages(req) {
        var _a, _b;
        const id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        const friendId = (_b = req.params) === null || _b === void 0 ? void 0 : _b.friendId;
        if (!id || !friendId)
            return errorDictionary_1.default.no_id_friends;
        const user = new userModel_1.default();
        const messages = await user.fetchMessages(id, friendId).catch(() => null);
        if (messages === null) {
            return errorDictionary_1.default.no_payload;
        }
        // Tri des messages entre "envoyés" et "reçus"
        let sent = [];
        let received = [];
        for (const msg of messages) {
            if (id == msg.user_sender_id) {
                sent.push(msg);
                continue;
            }
            received.push(msg);
        }
        return {
            sent: sent,
            received: received
        };
    }
    async sendMessage(req, reply) {
        var _a;
        const id = req.params.id;
        const friendId = req.params.friendId;
        const content = (_a = req.payload) === null || _a === void 0 ? void 0 : _a.content;
        if (!id || !friendId)
            return errorDictionary_1.default.no_id_friends;
        if (!content)
            return errorDictionary_1.default.no_payload;
        validator_1.default.escape(content);
        return new userModel_1.default().postMessage(id, friendId, content)
            .then(() => reply.response({ newMessage: content }).code(201))
            .catch((err) => errorDictionary_1.default[err.code] || errorDictionary_1.default.unidentified);
    }
}
exports.default = MessageController;
