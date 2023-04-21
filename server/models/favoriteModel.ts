import knex from '../db/knex'
import { Favorite as Fav } from '../types/types'


export default class Favorite {

    public async fetchAll(userId: number): Promise<Fav[]> {
        return (
            await knex
            .select('id', 'title', 'link', 'image', 'country', 'publication_date', 'description')
            .from('favorites')
            .where({user_id: userId})
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

    public async fetchOne(favoriteId: number): Promise<Fav> {
        return (
            await knex
            .select('id', 'title', 'link', 'image', 'country', 'publication_date', 'description')
            .from('favorites')
            .where({id: favoriteId})
            .first()
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

    public async delete(favoriteId: number): Promise<number> {
        return (
            await knex('favorites')
            .del()
            .where({id: favoriteId})
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

    public async create(properties: Fav): Promise<number[]> {
        return (
            await knex('favorites')
            .insert(properties)
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

}