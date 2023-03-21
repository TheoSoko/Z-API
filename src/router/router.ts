import userCtrl from '../controllers/userCtrl'
import search from '../controllers/searchCtrl'

//controllers
const user = new userCtrl()


export const endpoints = {
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
        ]
}