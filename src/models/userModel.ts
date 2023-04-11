import db from '../db/connection'
import { UserType } from '../types/queryTypes'
import { FriendShip, Message } from '../types/types'


export default class User{

    id!: number
    firstname!: string
    lastname!: string
    email!: string
    password!: string
    country!: string
    fiendShip!: {
        id: number
        user1Id: number
        user2Id: number
        confirmed: boolean 	
        date: Date | string
      }
  


    public async createUser(properties: UserType):Promise<number>{
        return (
            await db.insert(properties)
            .into('users')
            .then((result: typeof User.prototype) => result)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetchUser(id: number):Promise<typeof User.prototype | void>{
        return (
            await db.select('id','lastname', 'firstname', 'email', 'profile_picture', 'country')
                .from('users')
                .where({id: id})
                .first()
                .then((res: typeof User.prototype) => res)
                .catch((err:Error) => { 
                    console.log(err)
                    throw err 
                })
        )
    }
    
    public async fetchUserByEmail(email: string, idOnly?: boolean):Promise<typeof User.prototype | void>{
        return (
            await db.select(idOnly ? 'id' : 'id', 'password', 'lastname', 'firstname', 'email', 'profile_picture', 'country')
                .from('users')
                .where({email: email})
                .first()
                .then((res: typeof User.prototype) => res)
                .catch((err:Error) => { 
                    console.log(err)
                    throw err 
                })
        )
    }

    public async updateUser(id:number, payload: Partial<UserType>):Promise<number>{
        return (
            await db('users')
            .where({id: id})
            .update(payload)
            .then((affectedRows: number) => affectedRows)
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

    public async deleteUser(id:number):Promise<number>{
        return (
            await db('users')
            .where({id: id})
            .del()
            .then((affectedRows: number) => affectedRows)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    // Methodes friends

    public async fetchFriends(id:number):Promise<FriendShip[] | void>{
        return (
            await db
            .select('user1_id','user2_id', 'confirmed', 'date')
            .from('friendships')
            .where({confirmed: true})
            .andWhere({user1_id: id})
            .orWhere({user2_id: id})
            .then((res: FriendShip[]) => res)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async addFriend(id:number, friendId:number):Promise<number>{
        return (
            await db.insert({user1_id: id, user2_id: friendId})
            .into('friendships')
            .then((friendshipId: number) => friendshipId)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetchFriendshipInfo(id:number, friendId:number):Promise<FriendShip | void>{
        return (
            await db
            .select('user1_id','user2_id', 'confirmed', 'date')
            .from('friendships')
            .where({user1_id: id, user2_id: friendId})
            .orWhere({user1_id: friendId, user2_id: id})
            .first()
            .then((res: FriendShip) => res)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async acceptFriendship(id:number, friendId:number):Promise<number | void>{
        return (
            await db('friendships')
            .update({confirmed: true})
            .where({user1_id: friendId, user2_id: id})
            .then((affectedRows:number) => affectedRows)
            .catch((err:Error) => {
                console.log(err)
                throw err 
            })
        )
    }

    public async deleteFriendShip(id:number, friendId:number):Promise<number>{
        return (
            await db('friendships')
            .del()
            .where({user1_id: id, user2_id: friendId})
            .orWhere({user1_id: friendId, user2_id: id})
            .then((affectedRows:number) => affectedRows)
            .catch((err:Error) => {
                console.log(err)
                throw err
            })
        )
    }

    public async fetchMessages(id:number, friendId: number):Promise<Message[]>{
        return (
            await db
            .select('id', 'user_sender_id', 'user_receiver_id', 'friendship_id', 'content', 'created_at')
            .from('messages')
            .where({user_sender_id: id, user_receiver_id: friendId})
            .orWhere({user_sender_id: friendId, user_receiver_id: id})
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async postMessage(id:number, friendId: number, content: string):Promise<number>{
        return (
            await db('messages')
            .insert({
                content: content, 
                user_sender_id: id, 
                user_receiver_id: friendId
            })
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }


}   