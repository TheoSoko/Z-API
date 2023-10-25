"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.authParams = void 0;
require("dotenv").config();
const jwt_1 = __importDefault(require("@hapi/jwt"));
//import * as fs from 'fs/promises'
//keys: async () => fs.readFile('../key/key.txt'),
//  Important ! 
//  Pour toutes les routes comprenant un paramètre "{id}", celui-ci se réfère à l'id utilisateur
//  Celà nous permet de vérifier dans authParams.validate si ({id} dans route) == (Sujet du token)
// Note :
// Hapi/jwt vérifie le token à partir du moment ou la premiète section du chemin (e.g /users/) matche un endpoint, 
// même si la méthode http n'est pas supportée, ou si l'url n'existe pas, résultant en de mauvais status d'erreur (401 au lieu de 404 / 405)
exports.authParams = {
    keys: process.env.TOKEN_KEY,
    verify: {
        aud: 'api.zemus.info',
        iss: 'api.zemus.info',
        sub: false,
        nbf: true,
        exp: true,
        maxAgeSec: 36000, // 10 heures
    },
    validate: (artifacts, request, reply) => {
        var _a;
        let sub = artifacts.decoded.payload.sub; //subject
        let userId = (_a = request.params) === null || _a === void 0 ? void 0 : _a.id;
        if (userId != undefined && sub !== userId) { // (Sujet du token) !== ({id} dans route) 
            return {
                isValid: false,
                response: reply.response({
                    statusCode: 403,
                    error: 'Forbidden',
                    message: 'L\'utilisateur à qui appartient le token envoyé n\'est pas le même que celui identifié par l\'URL actuelle',
                })
                    .code(401)
            };
        }
        return {
            isValid: true,
            credentials: artifacts.decoded.payload
        };
    }
};
function generateToken(userId, email) {
    const token = jwt_1.default.token.generate({
        iss: 'api.zemus.info',
        aud: 'api.zemus.info',
        sub: String(userId),
        userEmail: email,
    }, 'Coffee Pot');
    return token;
}
exports.generateToken = generateToken;
