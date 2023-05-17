import knex from '../db/knex'
import { Favorite as Fav } from '../types/types'


export default class Favorite {

    public async fetchAll(userId: number): Promise<Fav[]> {
        return new Promise (async (success, failure) => {
            try {
                let response = await knex
                .select('id', 'title', 'link', 'image', 'country', 'publication_date', 'description')
                .from('favorites')
                .where({user_id: userId})
                 success(response)
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }

    public async fetchOne(favoriteId: number): Promise<Fav> {
        return new Promise (async (success, failure) => {
            try {
                let response = await knex
                .select('id', 'user_id', 'title', 'link', 'image', 'country', 'publication_date', 'description')
                .from('favorites')
                .where({id: favoriteId})
                .first()
                 success(response)
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }

    public async delete(favoriteId: number): Promise<number> {
        return new Promise (async (success, failure) => {
            try {
                let response = await knex('favorites')
                .del()
                .where({id: favoriteId})
                .catch((err:Error) => { 
                    console.log(err)
                    throw err
                })    
                 success(response)
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }

    public async create(properties: Fav): Promise<number[]> {
        return new Promise (async (success, failure) => {
            try {
                success(
                    await knex('favorites')
                    .insert(properties)
                )
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }

}