'use strict';
import Hapi, {Request, ResponseToolkit, ServerRoute, ServerOptions,ReqRefDefaults} from '@hapi/hapi'
const Path = require('path');
import search from './controllers/searchCtrl'
import inert from '@hapi/inert'
import Jwt from '@hapi/jwt';
import { endpoints } from './router/endpoints'
import { authParams } from './middlewares/auth'
import { checkDb } from './middlewares/middlewares'
require("dotenv").config();

//Gestion d'erreur à l'initialisation 
process.on('unhandledRejection', (err) => {console.log(err);process.exit(1)})

export const pubDir = __dirname + '/public'

//Le serveur
const init = async () => {

    const server = Hapi.server({
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
    })

    await server.register(inert)
    await server.register(Jwt)
    server.auth.strategy('default_jwt', 'jwt', authParams)
    
    if (process.env.ACTIVE_AUTH == "true") {
        server.auth.default('default_jwt') // **____**
    }
    server.ext('onRequest', checkDb);
    server.ext('onPreResponse', (req: Request, h: ResponseToolkit) => {
        //h.response.bind({Headers: {...Headers.prototype, "Access-Control-Allow-Origin": "*"}})
        return h.continue
    })
    
    // Enregistrement de toutes les routes
    // Ajout de la function middleware checkDb à options.pre dans chaque config de route
    for (const category in endpoints){
        let routesBunch = endpoints[category]
        for (const config of routesBunch){
            config.options = {... config.options, pre:[{ method: checkDb, assign: 'db' }] }
        }
        server.route(routesBunch)
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
}

init()
