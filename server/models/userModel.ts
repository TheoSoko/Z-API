import knex from '../db/knex'
import { UserInput, } from '../types/inputTypes'
import { FriendShip, Message, ReviewType, UserType } from '../types/types'
import { visibility } from '../constants/constants'


export default class User {  

    public async create(properties: UserInput):Promise<number[]>{
        return new Promise (async (success, failure) => {
            try {
                success(await knex.insert(properties).into('users'))  
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }

    public async fetch(id: number, basicInfo?: 'basicInfo'): Promise<UserType | void>{
        let fields = basicInfo
            ? ['id', 'lastname', 'firstname', 'profile_picture']
            : ['id', 'lastname', 'firstname', 'email', 'profile_picture', 'country']
            try {
                const res = await knex.select(fields)
                .from('users')
                .where({id: id})
                .first()
                return Promise.resolve(res)
            }
            catch (err) {
                console.log("CAUGHT EXCEPTION IN MODEL")
                console.log(err)
                return Promise.reject(err)
            }
    }
    
    public async fetchByEmail(email: string, idOnly?: 'idOnly'): Promise<UserType>{
        let fields = idOnly ? ['id'] : ['id', 'password', 'lastname', 'firstname', 'email', 'profile_picture', 'country']
        try {
            let resp = await knex('users')
            .select(fields)
            .where({email: email})
            .first()
            .then((res: UserType) => res)
            return new Promise(success => success(resp))
        }
        catch (err) {
            console.log(err)
            return new Promise((_, fail) => fail(err))
        }
    }

    public async update(id:number, payload: Partial<UserInput>): Promise<number>{
        return new Promise (async (success, failure) => {
            try {
                const res = await knex('users')
                .where({id: id})
                .update(payload)
                .then((affectedRows: number) => affectedRows)
                success(res)
            }
            catch (err) { 
                console.log(err)
                failure(err)
            }
        })
    }

    public async delete(id:number):Promise<number>{
        return new Promise (async (success, failure) => {
            try {
                success(
                    await knex('users')
                    .where({id: id})
                    .del()
                )
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }



/**
 * MESSAGES
*/

    public async fetchMessages(id:number, friendId: number): Promise<Message[]>{
        return new Promise (async (success, failure) => {
            try {
                const res = await knex
                .select('id', 'user_sender_id', 'user_receiver_id', 'friendship_id', 'content', 'created_at')
                .from('messages')
                .where({user_sender_id: id, user_receiver_id: friendId})
                .orWhere({user_sender_id: friendId, user_receiver_id: id})
                success(res)
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }

    public async postMessage(id:number, friendId: number, content: string): Promise<number[]>{
        return new Promise( async (success, failure) => {
            try {
                const res = await knex('messages')
                .insert({
                    content: content, 
                    user_sender_id: id, 
                    user_receiver_id: friendId
                })
                success(res)
            }
            catch (err) {
                console.log(err)
                failure(err)
            }
        })
    }
    

/**
 * FEED
*/


    public async fetchFeed(friends: number[], page: number): Promise<ReviewType[] | []>{
        try {
            let reviews =  (
                await knex('reviews')
                .select('reviews.id', 'reviews.theme', 'reviews.presentation', 'reviews.creation_date', 'user_id', 'reviews.visibility_id')
                .where('visibility_id', '>=', visibility['friends'])
                .andWhere((k) => {
                    k.andWhere({user_id: friends[0] ?? 0}) // A voir, si l'utilisateur n'a pas d'amis il récupère les revues de l'user 1
                    for (let i = 1; i < friends.length; i++){
                        if (friends[i]) k.orWhere({user_id: friends[i]})
                    }
                })
                .limit(50)
                .offset((page - 1) * 50)
                //.andWhere('creation_date', '>', '2023-01-01')
                .orderBy('creation_date', 'desc')
            )

            // Si pas de revues pour le feed
            if (reviews.length == 0){
                return []
            }

            const articles = (
                await knex('review_articles as articles')
                .select('articles.image', 'articles.country', 'articles.review_id')
                .where((k) => {
                    k.where({review_id: reviews[0].id})
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

            //add articles (array) property to each review
            reviews = reviews.map(rev => { return {...rev, articles: []} })
            //If articles.review_id = review.id : push article in review.articles
            articles.forEach((article) => {
                let revId = article.review_id
                reviews.forEach((review) => {
                    if (review.id == revId) review.articles.push(article)
                })
            })

            return new Promise(success => success(reviews))

        }
        catch(err) { 
            console.log(err)
            return new Promise((_, failure) => failure(err))
        }

    }



}   