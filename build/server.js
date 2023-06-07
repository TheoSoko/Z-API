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
//Gestion d'erreur à l'initialisation 
process.on('unhandledRejection', (err) => { console.log(err); process.exit(1); });
exports.pubDir = __dirname + '/public';
//Le serveur
const init = async () => {
    const server = hapi_1.default.server({
        port: 8080,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'],
                headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'], //default
            },
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    });
    await server.register(inert_1.default);
    await server.register(jwt_1.default);
    server.auth.strategy('default_jwt', 'jwt', auth_1.authParams);
    server.auth.default('default_jwt');
    // Enregistrement de toutes les routes
    // Ajout de la function middleware checkDb à options.pre dans chaque config de route
    for (const name in endpoints_1.endpoints) {
        let configObjects = endpoints_1.endpoints[name];
        for (const config of configObjects) {
            config.options = { ...config.options, pre: [{ method: middlewares_1.checkDb, assign: 'db' }] };
        }
        server.route(configObjects);
    }
    /*
        // Recherche
        server.route(
            {
                method: 'GET',
                path: '/search',
                handler: search
            }
        )
        
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
