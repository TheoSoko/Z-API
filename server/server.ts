'use strict';
import Hapi, {Request, ResponseToolkit, ServerRoute, ServerOptions,ReqRefDefaults} from '@hapi/hapi'
const Path = require('path');
import search from './controllers/searchCtrl'
import inert from '@hapi/inert'
import Jwt from '@hapi/jwt';
import { endpoints } from './router/endpoints'
import { authParams } from './middlewares/auth'
import { checkDb } from './middlewares/middlewares'

//Gestion d'erreur à l'initialisation 
process.on('unhandledRejection', (err) => {console.log(err);process.exit(1)})

export const pubDir = __dirname + '/public'

//Le serveur
const init = async () => {

    const server = Hapi.server({
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
    })

    await server.register(inert)
    await server.register(Jwt)
    server.auth.strategy('default_jwt', 'jwt', authParams)
    //server.auth.default('default_jwt');


    // Enregistrement de toutes les routes
    // Ajout de la function middleware checkDb à options.pre dans chaque config de route
    for (const name in endpoints){
        let configObjects = endpoints[name]
        for (const config of configObjects){
            config.options = {... config.options, pre:[{ method: checkDb, assign: 'db' }] }
        }
        server.route(configObjects)
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
    console.log(`Le serveur court à l\'adresse ${server.info.uri}`);
}

init()
