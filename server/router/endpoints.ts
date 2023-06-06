import UserCtrl from '../controllers/userCtrl'
import FriendCtrl from '../controllers/friendCtrl'
import MessageCtrl from '../controllers/messageCtrl'
import FavoriteCtrl from '../controllers/favoriteCtrl'
import ReviewCtrl from '../controllers/reviewCtrl'
import search from '../controllers/searchCtrl'
import {ServerRoute, ReqRefDefaults} from '@hapi/hapi'

//controllers
const user = new UserCtrl()
const friend = new FriendCtrl()
const message = new MessageCtrl()
const favorite = new FavoriteCtrl()
const review = new ReviewCtrl()

type Endpoints = {
    [key: string]: ServerRoute<ReqRefDefaults>[]
}


//  Important ! 
//  Pour toutes les routes comprenant un paramètre "{id}", celui-ci se réfère à l'id utilisateur
//  Celà nous permet de vérifier dans authParams.validate si ({id} dans route) == (Sujet du token)

// Note :
// Hapi/jwt vérifie le token à partir du moment ou la premiète section du chemin (e.g /users/) matche un endpoint, même si la méthode http n'est pas supportée, ou si l'url n'existe pas, résultant en de mauvais status d'erreur (401 au lieu de 404 / 405)

export const endpoints:Endpoints = {
    search:
        [
            {
                method: 'GET',
                path: '/search',
                handler: search,
                options: {
                    auth: false
                }
            },
        ],
    test:
        [
            {
                method: 'GET',
                path: '/test',
                handler: (req, res) => {
                    const xFF = req.headers['x-forwarded-for']
                    const ip = xFF ? "forwarded: " + xFF : req.info.remoteAddress

                    console.log('Recu à ', new Date(req.info.received))
                    console.log('Répondu en ', req.info.completed - req.info.received, ' secondes')
                    console.log('Requête depuis ', ip)
                    console.log('Hôte cherché: ', req.info.host)
                    console.log('*** ***')
                    return res.response('C\'est bon, c\'est tout goude.').code(200)
                },
                options: {
                    auth: false
                },
            },
        ],
    user:
        [
            {
                method: 'POST',
                path: '/sign-in',
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
        ],
    friends: 
        [
            {
                method: 'GET',
                path: '/users/{id}/friends',
                handler: friend.getAllFriends
            },
            {
                method: 'PUT',
                path: '/users/{id}/friends/{friendId}',
                handler: friend.friendRequest
            },
            {
                method: 'GET',
                path: '/users/{id}/friends/{friendId}',
                handler: friend.getFriendship
            },
            {
                method: 'DELETE',
                path: '/users/{id}/friends/{friendId}',
                handler: friend.unfriend
            },
        ],
    messages: 
        [
            {
                method: 'GET',
                path: '/users/{id}/friends/{friendId}/messages',
                handler: message.getMessages,

            },
            {
                method: 'POST',
                path: '/users/{id}/friends/{friendId}/messages',
                handler: message.sendMessage 
            }
        ],
    favorites:
        [
            {
                method: 'GET',
                path: '/users/{id}/favorites',
                handler: favorite.getUserFavorites,
            },
            {
                method: 'GET',
                path: '/favorites/{favoriteId}',
                handler: favorite.getOneFavorite
            },
            {
                method: 'DELETE',
                path: '/favorites/{favoriteId}',
                handler: favorite.deleteFavorite
            },
            {
                method: 'POST',
                path: '/users/{id}/favorites',
                handler: favorite.addFavorite
            },
        ],
    reviews: 
        [
            {
                method: 'GET',
                path: '/users/{userId}/reviews',
                handler: review.getUserReviews
            },
            {
                method: 'GET',
                path: '/reviews/{reviewId}',
                handler: review.getReviewById
            },
            {
                method: 'DELETE',
                path: '/reviews/{reviewId}',
                handler: review.deleteReview
            },
            {
                method: 'POST',
                path: '/users/{id}/reviews/articles',
                handler: review.createReviewAndArticles
            },
            {
                method: 'POST',
                path: '/users/{id}/reviews',
                handler: review.createReview
            },
            {
                method: 'POST',
                path: '/reviews/{reviewId}/articles',
                handler: review.postArticles
            },
            {
                method: 'DELETE',
                path: '/reviews/{reviewId}/articles',
                handler: review.removeArticles
            },
            {
                method: 'PATCH',
                path: '/reviews/{reviewId}',
                handler: review.updateReview
            },
            {
                method: 'GET',
                path: '/users/{id}/feed',
                handler: user.getFeed
            }
        ],
    images: [
        {
            method: 'GET',
            path: '/users/{id}/profile-picture',
            handler: user.getProfilePic
        },
        {
            method: 'PUT',
            path: '/users/{id}/profile-picture',
            options: {
                payload: {
                    parse: true,
                    output: 'file',
                    maxBytes: 2000001
                },
            },
            handler: user.setProfilePic,
        }
    ]

}