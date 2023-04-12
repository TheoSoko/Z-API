import {Request, ResponseToolkit} from '@hapi/hapi'
import boom from '@hapi/boom'
import User from '../models/userModel'
import Errors from '../errorHandling/errorDictionary'


export default class FriendCtrl {

    public async getAllFriends (req: Request){

        if (req.pre.db == null) return Errors.db_unavailable

        const senderId = req.params?.id
        if (!senderId) return Errors.no_id

        const user = new User()
        const friendships = await user.fetchFriends(senderId).catch(() => null) // renvoie null si erreur

        if (friendships == null) return Errors.unidentified

        const friends = []
        for (const friendship of friendships){
            let friendId = (senderId == friendship.user1_id) 
                ? friendship.user2_id
                : friendship.user1_id
            const friend = await user.fetchUser(friendId)
            friends.push({
                ...friend, since: friendship.date
            })
        }

        return friends
        
    }

    public async friendRequest (req: Request, reply: ResponseToolkit){

        if (req.pre.db == null) return Errors.db_unavailable

        const id = req.params?.id
        const friendId = req.params?.friendId
        if (!id || !friendId) return Errors.no_id_friends

        const user = new User()
        const friendship = await user.fetchFriendshipInfo(id, friendId)

        //Si déjà amis : 409 Conflict
        if (friendship !== undefined && friendship.confirmed == 1){
            return Errors.already_friends
        }
        //Si demande déjà envoyée par l'autre utilisateur : accepte la demande
        if (friendship !== undefined && id == friendship.user2_id){
            return await user.acceptFriendship(id, friendId)
                    .then(() => {
                        return {
                            message: 'Demande d\'ami acceptée',
                            newFriend: `./users/${id}/friends/${friendId}`
                        }
                    })
                    .catch((err: {code: string}) => {
                        return Errors[err.code] || Errors.unidentified
                    })
        }
        //Si demande déjà envoyée : 409 Conflict
        if (friendship !== undefined){
            return Errors.already_sent_invitation // demande déjà envoyée
        }
        
        //Sinon, crée nouvelle demande
        return (
            await user.addFriend(id, friendId)
            .then(() => {
                return reply.response({newFriendship: `./users/${id}/friends/${friendId}`}).code(201)
            })
            .catch((err: {code: string}) => {
                return Errors[err.code] || Errors.server
            })
        )
    }

    public async getFriendship (req: Request){
        
        if (req.pre.db == null) return Errors.db_unavailable

        const id = req.params?.id
        const friendId = req.params?.friendId
        if (!id || !friendId){
            return Errors.no_id_friends
        }
        const user = new User()
        const response = await user.fetchFriendshipInfo(id, friendId)
            .then( friendship => friendship || boom.notFound() )
            .catch((err: {code: string}) => {
                return Errors[err.code] || Errors.server
            })

        return response 
    }

    public async deleteFriendship (req: Request){
        if (req.pre.db == null) return Errors.db_unavailable

        const id = req.params?.id
        const friendId = req.params?.friendId
        if (!id || !friendId){
            return Errors.no_id_friends
        }
        let response = await new User().deleteFriendShip(id, friendId)
        return {affectedRows: response}
    }
}