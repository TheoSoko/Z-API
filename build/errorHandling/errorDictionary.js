"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom_1 = __importDefault(require("@hapi/boom"));
const Errors = {
    'ER_NO_DEFAULT_FOR_FIELD': boom_1.default.badData('Un des paramètres n\'a pas été fourni'),
    existing_user: boom_1.default.conflict('Un utilisateur avec cette adresse email existe déjà'),
    unidentified: boom_1.default.badImplementation('Veuillez nous excuser, une erreur inconnue est survenue'),
    server: boom_1.default.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    no_payload: boom_1.default.badRequest('Le corps de la requête est vide, il devrait contenir les informations nécessaires à celle-ci'),
    no_id: boom_1.default.badRequest('Veuillez fournir un id dans l\'url de la requête'),
    no_ressource_id: boom_1.default.badRequest('Veuillez utiliser l\'id de la ressource pour construire l\'url de la requête'),
    no_user_id: boom_1.default.badRequest('Veuillez utiliser l\'id de l\'utilisateur pour construire l\'url de la requête'),
    no_id_friends: boom_1.default.badRequest('Veuillez fournir les id des deux utilisateurs concernés dans l\'url de la requête'),
    already_friends: boom_1.default.conflict('Les utilisateurs sont déjà amis'),
    already_sent_invitation: boom_1.default.conflict('Une demande d`\'ami a déjà été envoyée de la part de l\'utilisateur actuel'),
    not_found: boom_1.default.notFound('Désolé, la ressource n\'a pas été trouvée'),
    not_found_2: boom_1.default.notFound('La ressource indiquée n\'a pas été trouvée'),
    delete_no_query: boom_1.default.badRequest('Veuillez indiquez le(s) id(s) des articles à enlever de la revue en paramètre de "query" comme ceci: ?id=1,2,3'),
    //For development only
    db_unavailable: boom_1.default.serverUnavailable('Impossible de se connecter à la base de données'),
};
exports.default = Errors;
