"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpoints = void 0;
const userCtrl_1 = __importDefault(require("../controllers/userCtrl"));
const friendCtrl_1 = __importDefault(require("../controllers/friendCtrl"));
const messageCtrl_1 = __importDefault(require("../controllers/messageCtrl"));
const favoriteCtrl_1 = __importDefault(require("../controllers/favoriteCtrl"));
const reviewCtrl_1 = __importDefault(require("../controllers/reviewCtrl"));
const searchCtrl_1 = __importDefault(require("../controllers/searchCtrl"));
//controllers
const user = new userCtrl_1.default();
const friend = new friendCtrl_1.default();
const message = new messageCtrl_1.default();
const favorite = new favoriteCtrl_1.default();
const review = new reviewCtrl_1.default();
//  Important ! 
//  Pour toutes les routes comprenant un paramètre "{id}", celui-ci se réfère à l'id utilisateur
//  Celà nous permet de vérifier dans authParams.validate si ({id} dans route) == (Sujet du token)
// Note :
// Hapi/jwt vérifie le token à partir du moment ou la premiète section du chemin (e.g /users/) matche un endpoint, même si la méthode http n'est pas supportée, ou si l'url n'existe pas, résultant en de mauvais status d'erreur (401 au lieu de 404 / 405)
exports.endpoints = {
    auth: [
        {
            method: 'POST',
            path: '/sign-in',
            handler: user.userSignIn,
            options: {
                auth: false
            }
        },
        {
            method: 'GET',
            path: '/auth',
            handler: user.authFromExt,
        }
    ],
    search: [
        {
            method: 'GET',
            path: '/search',
            handler: searchCtrl_1.default,
            options: {
                auth: false
            }
        },
    ],
    test: [
        {
            method: 'GET',
            path: '/test',
            handler: (req, res) => {
                const xFF = req.headers['x-forwarded-for'];
                const ip = xFF ? "forwarded: " + xFF : req.info.remoteAddress;
                console.log('*** ***\n');
                console.log('Recu à ', new Date(req.info.received));
                console.log('Requête depuis ', ip);
                console.log('Hôte cherché: ', req.info.host);
                //console.log('Répondu en ', (req.info.completed == 0) ? "Pas répondu" : (req.info.completed - req.info.received), ' secondes')
                console.log('*** ***\n');
                return res.response('C\'est bon, c\'est tout goude.').code(200);
            },
            options: {
                auth: false
            },
        },
    ],
    user: [
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
    friends: [
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
    messages: [
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
    favorites: [
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
    reviews: [
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
    ],
    /*
    test_db: [
        {
            method: 'GET',
            path: '/test-db',
            options: {
                auth: false
            },
            handler: async (req, res) => {
                const conn = await db.raw('select 1 + 1;').catch((err) => {
                    console.log(err);
                    throw boom.serverUnavailable("Erreur de connexion à la bdd")
                })
                return res.response('OK').code(200)
            }
        }
    ],
    */
};
