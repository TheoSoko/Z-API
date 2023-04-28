import knex from '../db/knex'
//import Knex from 'knex'
import { UserType, } from '../types/types'
import { UserInput, } from '../types/inputTypes'
import { FriendShip, Message } from '../types/types'


export default class User{  


    public async create(properties: UserInput):Promise<number[]>{
        return (
            await knex.insert(properties)
            .into('users')
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetch(id: number): Promise<UserType | void>{
        return (
            await knex.select('id','lastname', 'firstname', 'email', 'profile_picture', 'country')
                .from('users')
                .where({id: id})
                .first()
                .then((res: UserType) => res)
                .catch((err:Error) => { 
                    console.log(err)
                    throw err 
                })
        )
    }
    
    public async fetchByEmail(email: string, just?: {idOnly: boolean}): Promise<UserType>{
        return (
            await knex.select((just?.idOnly) ? "'id'" : "'id', 'password', 'lastname', 'firstname', 'email', 'profile_picture', 'country'")
                .from('users')
                .where({email: email})
                .first()
                .then((res: UserType) => res)
                .catch((err:Error) => { 
                    console.log(err)
                    throw err 
                })
        )
    }

    public async update(id:number, payload: Partial<UserInput>): Promise<number>{
        return (
            await knex('users')
            .where({id: id})
            .update(payload)
            .then((affectedRows: number) => affectedRows)
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

    public async delete(id:number):Promise<number>{
        return (
            await knex('users')
            .where({id: id})
            .del()
            .then((affectedRows: number) => affectedRows)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }



/**
 * MESSAGES
*/

    public async fetchMessages(id:number, friendId: number): Promise<Message[]>{
        return (
            await knex
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

    public async postMessage(id:number, friendId: number, content: string): Promise<number[]>{
        return (
            await knex('messages')
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
    

/**
 * FEED
*/


    public async fetchFeed(friends: number[], page: number) {
        try {

            let reviews =  (
                await knex('reviews')
                .select('reviews.id', 'reviews.theme', 'reviews.presentation', 'reviews.creation_date')
                .where((k) => {
                    k.where({user_id: friends[0] ?? 0}) // A voir, si l'utilisateur n'a pas d'amis ( 👈 😄 ) il récupère les revues de l'user 0
                    for (let i = 1; i < friends.length; i++){
                        if (friends[i]) k.orWhere({user_id: friends[i]})
                    }
                })
                .limit(50)
                .offset((page - 1) * 50)
                //.andWhere('creation_date', '>', '2023-01-01')
                .orderBy('creation_date', 'desc')
            )

            const articles = (
                await knex('review_articles as articles')
                .select('articles.image', 'articles.country', 'articles.review_id')
                .where((k) => {
                    k.where({review_id: reviews[0].id ?? 0})
                    for (let i = 1; i < reviews.length; i++){
                        if (reviews[i]) k.orWhere({review_id: reviews[i].id})
                    }
                })
                .whereNotNull('title')
                .union(
                        knex('review_articles')
                        .select('fav.image', 'fav.country', 'review_articles.review_id')
                        .join(
                            'favorites as fav',
                            'review_articles.favorite_id', '=', 'fav.id'
                        )
                        .where((k) => {
                            k.where({review_id: reviews[0].id ?? 0})
                            for (let i = 1; i < reviews.length; i++){
                                if (reviews[i]) k.orWhere({review_id: reviews[i].id})
                            }
                        })
                )
            )

            //add articles array property to each review
            reviews = reviews.map(rev => { return {...rev, articles: []} })
            //If articles.review_id = review.id : push article in review.articles
            articles.forEach((article) => {
                let revId = article.review_id
                reviews.forEach((review) => {
                    if (review.id == revId) review.articles.push(article)
                })
            })

            return reviews

        }
        catch(err) { 
            console.log(err)
            throw err
        }

    }



}   