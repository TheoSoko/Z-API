import knex from '../db/knex'
import { FriendShip } from '../types/types'


export default class Friend {


    public async fetchAll(id:number): Promise<FriendShip[] | void>{
        return (
            await knex
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

    public async add(id:number, friendId:number): Promise<number[]>{
        return (
            await knex.insert({user1_id: id, user2_id: friendId})
            .into('friendships')
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetchFriendship(id:number, friendId:number): Promise<FriendShip | void>{
        return (
            await knex
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

    public async accept(id:number, friendId:number): Promise<number | void>{
        return (
            await knex('friendships')
            .update({confirmed: true})
            .where({user1_id: friendId, user2_id: id})
            .then((affectedRows:number) => affectedRows)
            .catch((err:Error) => {
                console.log(err)
                throw err 
            })
        )
    }

    public async remove(id:number, friendId:number): Promise<number>{
        return (
            await knex('friendships')
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