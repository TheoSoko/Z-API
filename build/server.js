'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubDir = void 0;
const hapi_1 = __importDefault(require("@hapi/hapi"));
const Path = require('path');
const inert_1 = __importDefault(require("@hapi/inert"));
const jwt_1 = __importDefault(require("@hapi/jwt"));
const endpoints_1 = require("./router/endpoints");
const auth_1 = require("./middlewares/auth");
const middlewares_1 = require("./middlewares/middlewares");
require("dotenv").config();
//Gestion d'erreur à l'initialisation 
process.on('unhandledRejection', (err) => { console.log(err); process.exit(1); });
exports.pubDir = __dirname + '/public';
//Le serveur
const init = async () => {
    const server = hapi_1.default.server({
        port: process.env.SERVER_PORT,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Access-Control-Allow-Origin', 'Accept', 'Authorization', 'Content-Type', 'If-None-Match'], //default
            },
            files: {
                relativeTo: Path.join(__dirname, 'public')
            },
        }
    });
    await server.register(inert_1.default);
    await server.register(jwt_1.default);
    server.auth.strategy('default_jwt', 'jwt', auth_1.authParams);
    if (process.env.ACTIVE_AUTH == "true") {
        server.auth.default('default_jwt'); // **____**
    }
    server.ext('onRequest', middlewares_1.checkDb);
    server.ext('onPreResponse', (req, h) => {
        //h.response.bind({Headers: {...Headers.prototype, "Access-Control-Allow-Origin": "*"}})
        return h.continue;
    });
    // Enregistrement de toutes les routes
    // Ajout de la function middleware checkDb à options.pre dans chaque config de route
    for (const category in endpoints_1.endpoints) {
        let routesBunch = endpoints_1.endpoints[category];
        for (const config of routesBunch) {
            config.options = { ...config.options, pre: [{ method: middlewares_1.checkDb, assign: 'db' }] };
        }
        server.route(routesBunch);
    }
    /*
        
        //Traductions
        server.route(
            {
                method: 'GET',
                path: 'country-traduction',
                handler: getCountryLanguage
            }
        )
    
    */
    await server.start();
    console.log(`Le serveur court à l\'adresse : ${server.info.uri}`);
};
init();
