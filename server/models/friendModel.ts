import knex from '../db/knex'
import { FriendShip } from '../types/types'


export default class Friend {


    public async fetchAll(id:number): Promise<FriendShip[] | []>{
        try {
            const res = await knex('friendships')
                .select('user1_id','user2_id', 'confirmed', 'date')
                .where({confirmed: true})
                .andWhere({user1_id: id})
                .orWhere({user2_id: id})
            return new Promise ((success) => success(res))
        }
        catch (err) {
            return new Promise ((_, fail) => { console.log(err); fail(err) }) 
        }
    }

    public async add(id:number, friendId:number): Promise<number[]>{
        try {
            const res = await knex.insert({
                user1_id: id, 
                user2_id: friendId
            })
            .into('friendships')
            return new Promise ((success) => success(res))
        }
        catch (err) {
            return new Promise ((_, fail) => { console.log(err); fail(err) }) 
        }
    }

    public async fetchFriendship(id:number, friendId:number): Promise<FriendShip | void>{
        try {
            const res = await knex
            .select('user1_id','user2_id', 'confirmed', 'date')
            .from('friendships')
            .where({user1_id: id, user2_id: friendId})
            .orWhere({user1_id: friendId, user2_id: id})
            .first()
            return new Promise(success => success(res))
        }
        catch (err) {
            return new Promise ((_, fail) => { console.log(err); fail(err) }) 
        }
        
    }

    public async accept(id:number, friendId:number): Promise<number | void>{
        try {
            const res = await knex('friendships')
            .update({confirmed: true})
            .where({user1_id: friendId, user2_id: id})
            .then((affectedRows:number) => affectedRows)
            return new Promise(success => success(res))
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err) })
        }
    }

    public async remove(id:number, friendId:number): Promise<number>{
        try {
            const res = await knex('friendships')
            .del()
            .where({user1_id: id, user2_id: friendId})
            .orWhere({user1_id: friendId, user2_id: id})
            .then((affectedRows:number) => affectedRows)
            return new Promise(success => success(res))
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err) })
        }
    }

    public async fetchInvitations(id:number): Promise<FriendShip[]>{
        try {
            const res = await knex('friendships')
            .join('users', 'users.id', '=', 'friendships.user1_id')
            .select('users.id', 'users.firstname', 'users.lastname', 'users.email', 'users.profile_picture', 'users.country')
            .where({user2_id: id})
            .andWhere({confirmed: false})
            return new Promise(success => success(res))
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err) })
        }
    }


}