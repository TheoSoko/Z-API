import zemusDb from '../db/dbConnection'
import { UserType } from '../types/queryTypes'
import { FriendShip } from '../types/types'


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
            await zemusDb.insert(properties)
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
            await zemusDb.select('id','lastname', 'firstname', 'email', 'profile_picture', 'country')
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
    
    public async fetchUserByEmail(email: string, idOnly?: boolean):Promise<Partial<typeof User.prototype> | void>{
        return (
            await zemusDb.select(idOnly ? 'id' : 'id', 'password', 'lastname', 'firstname', 'email', 'profile_picture', 'country')
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
            await zemusDb('users')
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
            await zemusDb('users')
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
            await zemusDb
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
            await zemusDb.insert({user1_id: id, user2_id: friendId})
            .into('friendships')
            .then((friendshipId: number) => friendshipId)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async getFriendship(id:number, friendId:number):Promise<FriendShip | void>{
        return (
            await zemusDb
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
            await zemusDb('friendships')
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
            await zemusDb('friendships')
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


}   