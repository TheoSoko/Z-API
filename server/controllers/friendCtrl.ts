import {Request, ResponseToolkit} from '@hapi/hapi'
import boom from '@hapi/boom'
import Friend from '../models/friendModel'
import User from '../models/userModel'
import Errors from '../errorHandling/errorDictionary'


export default class FriendCtrl {

    public async getAllFriends (req: Request){
        const senderId = req.params?.id
        if (!senderId) return Errors.no_id

        const friend = new Friend()
        const user = new User()

        const friendships = await friend.fetchAll(senderId)
            .catch(() => { throw Errors.unidentified })

        const friendList = []
        for (const fr of friendships){
            if (!fr.confirmed) {
                continue
            }
            let friendId = (senderId == fr.user1_id) 
                ? fr.user2_id
                : fr.user1_id
            const friendUser = await user.fetch(friendId)
            friendList.push({
                ...friendUser, since: fr.date
            })
        }

        return friendList
    }

    public async friendRequest (req: Request, reply: ResponseToolkit) {
        const id = req.params?.id
        const friendId = req.params?.friendId
        if (!id || !friendId) return Errors.no_id_friends

        const friend = new Friend()
        const friendship = await friend.fetchFriendship(id, friendId)

        //Si déjà amis : 409 Conflict
        if (friendship?.confirmed == 1){
            return Errors.already_friends
        }
        
        //Si demande déjà envoyée par l'autre utilisateur : accepte la demande
        if (id == friendship?.user2_id){
            return await friend.accept(id, friendId)
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
            await friend.add(id, friendId)
            .then(() => {
                return reply.response({newFriendship: `./users/${id}/friends/${friendId}`}).code(201)
            })
            .catch((err: {code: string}) => {
                return Errors[err.code] || Errors.unidentified
            })
        )
    }

    public async getFriendship (req: Request){
        const id = req.params?.id
        const friendId = req.params?.friendId
        if (!id || !friendId){
            return Errors.no_id_friends
        }

        const friend = new Friend()
        return await friend.fetchFriendship(id, friendId)
            .then( friendship => friendship ?? boom.notFound() )
            .catch((err: {code: string}) => {
                return Errors[err.code] || Errors.unidentified
            })
    }

    public async unfriend (req: Request) {
        const id = req.params?.id
        const friendId = req.params?.friendId
        
        if (!id || !friendId){
            return Errors.no_id_friends
        }

        let response = await new Friend().remove(id, friendId)
        return {affectedRows: response}
    }

    public async getInvitations (req: Request, h: ResponseToolkit) {
        const id = req.params?.id
        
        if (!id) {
            return Errors.no_id
        }

        let response = await new Friend().fetchInvitations(id)

        return h.response({friend_requests: response}).code(200)
    }


}