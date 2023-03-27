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
        const id = request.params?.id
        if (!id){
            return errorDictionnary.noId
        }
        const user = new User()
        const friendships = await user.fetchFriends(id).then(res => res)
        
        if (!friendships) {
            return errorDictionnary.unidentified
        }

        const friendsInfo = []
        for (const friendship of friendships){
            let friendId = friendship.user1_id == id ? friendship.user1_id : friendship.user2_id
            const userInfo = await user.fetchUser(friendId).then(res => res)
            userInfo && friendsInfo.push({userInfo: userInfo, friendshipInfo: friendship})
        }

        return friendsInfo
    }

    public async createFriendship (){
        
    }

    public async getFriendship (){
        
    }

    public async deleteFriendship (){

    }
}