'use strict';
import Hapi, {Request, ResponseToolkit, ServerRoute, ReqRefDefaults} from '@hapi/hapi'
import search from './controllers/searchCtrl'
import userCtrl from './controllers/userCtrl'
import Jwt from '@hapi/jwt';
import authParams from './middlewares/auth'
import { endpoints } from './router/router'

//Gestion d'erreur à l'initialisation 
process.on('unhandledRejection', (err) => {console.log(err);process.exit(1)})



//Le serveur
const init = async () => {

    const server = Hapi.server({
        port: 8080,
        host: 'localhost'
    })

    await server.register(Jwt)
    server.auth.strategy('default_jwt', 'jwt', authParams)
    server.auth.default('default_jwt');


    for (const key in endpoints){
        let routeArray = endpoints[key as keyof typeof endpoints]
        server.route(routeArray)
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
                path: 'reviews',
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
