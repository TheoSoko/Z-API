'use strict';
import Hapi, {Request, ResponseToolkit, ServerRoute, ServerOptions,ReqRefDefaults} from '@hapi/hapi'
import search from './controllers/searchCtrl'
import Jwt from '@hapi/jwt';
import { endpoints } from './router/endpoints'
import { authParams } from './middlewares/auth'
import { checkDb } from './middlewares/middlewares'

//Gestion d'erreur à l'initialisation 
process.on('unhandledRejection', (err) => {console.log(err);process.exit(1)})


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
        }
    })


    await server.register(Jwt)
    server.auth.strategy('default_jwt', 'jwt', authParams)
    server.auth.default('default_jwt');


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
    
    // Utilisateurs
    server.route(
        [
            {
                method: 'POST',
                path: '/users/sign-in',
                options: {
                    auth: false
                },
                handler: user.userSignIn
            },
            {
                method: 'POST',
                path: '/users',
                handler: user.createUser
            },
            {
                method: 'GET',
                path: '/users/{id}',
                options: {
                    auth: false
                },
                handler: user.getUserById
            },
            {
                method: 'PATCH',
                path: '/users/{id}',
                handler: user.updateUser
            },
            {
                method: 'DELETE',
                path: '/users/{id}',
                handler: user.deleteUser
            },
        ]
    )


    // Amis
    server.route(
        [
            {
                method: 'GET',
                path: '/users/{id}/friends',
                handler: getFriends
            },
            {
                method: 'POST',
                path: '/users/{id}/friends',
                handler: createFriendship
            },
            {
                method: 'GET',
                path: 'friendships/{id}',
                handler: getFriendShip
            },
            {
                method: 'DELETE',
                path: 'friendships/{id}',
                handler: deleteUser
            },
        ]
    )

    // Messages
    server.route(
        [
            {
                method: 'GET',
                path: 'users/{id}/friends/{friend-id}/messages',
                handler: getMessages
            },
            {
                method: 'POST',
                path: 'users/{id}/friends/{friend-id}/messages',
                handler: sendMessage
            }
        ]
    )

    // Favoris
    server.route(
        [
            {
                method: 'GET',
                path: 'users/{id}/favorites',
                handler: getUserFavorites
            },
            {
                method: 'POST',
                path: 'users/{id}/favorites',
                handler: addFavorites
            },
            {
                method: 'GET',
                path: 'favorites/{id}',
                handler: getFavoriteById
            },
            {
                method: 'DELETE',
                path: 'favorites/{id}',
                handler: deleteFavorite
            },
            {
                method: 'GET',
                path: 'favorites',
                handler: getFavoritesForFeed
            },
        ]
    )

    // Revues
    server.route(
        [
            {
                method: 'GET',
                path: 'users/{id}/reviews',
                handler: getUserReviews
            },
            {
                method: 'POST',
                path: 'users/{id}/reviews',
                handler: createReview
            },
            {
                method: 'GET',
                path: 'reviews/:id',
                handler: getReviewById
            },
            {
                method: 'PATCH',
                path: 'reviews/:id',
                handler: updateReview
            },
            {
                method: 'DELETE',
                path: 'reviews/:id',
                handler: deleteReview
            },
            {
                method: 'GET',
                path: 'users/{id}/feed',
                handler: getReviewsForFeed
            },
        ]
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
