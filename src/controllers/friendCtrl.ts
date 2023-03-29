import {Request, ResponseToolkit} from '@hapi/hapi'
import boom from '@hapi/boom'
import { UserType } from '../types/queryTypes'
import { FriendShip } from '../types/types'
import User from '../models/userModel'
import Validation from '../utils/validation'
import ValidationModels from '../utils/validationModels'
import errorDictionnary from '../utils/errorDictionnary'


export default class FriendCtrl {

    public async getAllFriends (request: Request, h: ResponseToolkit){
        const senderId = request.params?.id
        if (!senderId){
            return errorDictionnary.noId
        }
        const user = new User()
        const friendships = await user.fetchFriends(senderId).then(res => res)
        
        if (!friendships) {
            return errorDictionnary.unidentified
        }

        const friends = []
        for (const friendship of friendships){
            let friendId = friendship.user1_id == senderId ? friendship.user2_id : friendship.user1_id
            const friend = await user.fetchUser(friendId).then(res => res)
            friends.push({
                ...friend, since: friendship.date
            })
        }

        return friends
    }

    public async friendRequest (request: Request, h: ResponseToolkit){
        const id = request.params?.id
        const friendId = request.params?.friendId
        if (!id || !friendId){
            return errorDictionnary.noIdFriends
        }

        const user = new User()

        //Vérification sur l'existance d'une amitié ou demande d'ami précédente
        const friendship = await user.getFriendship(id, friendId)

        if (friendship !== undefined && friendship.confirmed == 1){
            return errorDictionnary.alreadyFriends //déjà amis
        }
        if (friendship !== undefined && id == friendship.user2_id){
            return h.response({
                message: 'L\'utilisateur destinataire a déjà envoyé une demande à l\'utilisateur actuel, veuillez envoyer une requête PATCH? au lien suivant',
                link: `./users/${id}/friend-requests/${friendship.user1_id}`
            })
            .code(303)
        }
        if (friendship !== undefined){
            errorDictionnary.alreadySent // demande déjà envoyée
        }
        
        const newFriendship = await user.addFriend(id, friendId)
            .then(friendshipId => friendshipId)
            .catch(() => false)
        if (!newFriendship){
            return errorDictionnary.server
        }

        return {
            newFriend: `./users/${friendId}`
        }
    }

    public async getFriendship (request: Request, h: ResponseToolkit){
        const id = request.params?.id
        const friendId = request.params?.friendId
        if (!id || !friendId){
            return errorDictionnary.noIdFriends
        }
        const user = new User()
        const friendship = await user.getFriendship(id, friendId)
            .then(res => res)
            .catch((err: {code: string}) => {
                return errorDictionnary[err.code] || errorDictionnary.unidentified
            })

        return friendship
    }

    public async deleteFriendship (){

    }
}