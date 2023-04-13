import UserCtrl from '../controllers/userCtrl'
import FriendCtrl from '../controllers/friendCtrl'
import MessageCtrl from '../controllers/messageCtrl'
import FavoriteCtrl from '../controllers/favoriteCtrl'
import search from '../controllers/searchCtrl'
import {ServerRoute, ReqRefDefaults} from '@hapi/hapi'

//controllers
const user = new UserCtrl()
const friendCtrl = new FriendCtrl()
const messageCtrl = new MessageCtrl()
const favoriteCtrl = new FavoriteCtrl()


type Endpoints = {
    [key: string]: ServerRoute<ReqRefDefaults>[]
}

export const endpoints:Endpoints = {
    search:
        [
            {
                method: 'GET',
                path: '/search',
                handler: search
            },
        ],
    test:
        [
            {
                method: 'GET',
                path: '/test',
                handler: () => 'C\'est bon'
            },
        ],
    user:
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
                handler: friendCtrl.getAllFriends
            },
            {
                method: 'PUT',
                path: '/users/{id}/friends/{friendId}',
                handler: friendCtrl.friendRequest
            },
            {
                method: 'GET',
                path: '/users/{id}/friends/{friendId}',
                handler: friendCtrl.getFriendship
            },
            {
                method: 'DELETE',
                path: '/users/{id}/friends/{friendId}',
                handler: friendCtrl.deleteFriendship
            },
        ],
    messages: 
        [
            {
                method: 'GET',
                path: '/users/{id}/friends/{friendId}/messages',
                handler: messageCtrl.getMessages,

            },
            {
                method: 'POST',
                path: '/users/{id}/friends/{friendId}/messages',
                handler: messageCtrl.sendMessage 
            }
        ],
    favorites:         
        [
            {
                method: 'GET',
                path: '/users/{id}/favorites',
                handler: favoriteCtrl.getUserFavorites,
            },
            {
                method: 'GET',
                path: '/favorites/{favoriteId}',
                handler: favoriteCtrl.getOneFavorite
            },
            {
                method: 'DELETE',
                path: '/favorites/{favoriteId}',
                handler: favoriteCtrl.deleteFavorite
            },
            {
                method: 'POST',
                path: '/users/{id}/favorites',
                handler: favoriteCtrl.addFavorite
            },
            {
                method: 'GET',
                path: '/favorites',
                handler: favoriteCtrl.getFavoritesForFeed
            },
        ]

}