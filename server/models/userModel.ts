import knex from '../db/knex'
import Knex from 'knex'
import { UserType, } from '../types/queryTypes'
import { FriendShip, Message, Favorite, Review, ReviewInput, Article } from '../types/types'


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
  


    public async createUser(properties: UserType):Promise<number[]>{
        return (
            await knex.insert(properties)
            .into('users')
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetchUser(id: number):Promise<typeof User.prototype | void>{
        return (
            await knex.select('id','lastname', 'firstname', 'email', 'profile_picture', 'country')
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
            await knex.select(idOnly ? 'id' : 'id', 'password', 'lastname', 'firstname', 'email', 'profile_picture', 'country')
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

    public async deleteUser(id:number):Promise<number>{
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
 * FRIENDS
*/

    public async fetchFriends(id:number):Promise<FriendShip[] | void>{
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

    public async addFriend(id:number, friendId:number):Promise<number[]>{
        return (
            await knex.insert({user1_id: id, user2_id: friendId})
            .into('friendships')
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetchFriendshipInfo(id:number, friendId:number):Promise<FriendShip | void>{
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

    public async acceptFriendship(id:number, friendId:number):Promise<number | void>{
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

    public async deleteFriendShip(id:number, friendId:number):Promise<number>{
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



/**
 * FAVORITES
*/

    public async fetchMessages(id:number, friendId: number):Promise<Message[]>{
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

    public async postMessage(id:number, friendId: number, content: string):Promise<number[]>{
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
 * FAVORITES
*/

    public async fetchFavorites(userId: number): Promise<Favorite[]> {
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

    public async fetchOneFavorite(favoriteId: number): Promise<Favorite> {
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

    public async deleteFavorite(favoriteId: number): Promise<number> {
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

    public async createFavorite(properties: Favorite): Promise<number[]> {
        return (
            await knex('favorites')
            .insert(properties)
            .catch((err:Error) => { 
                console.log(err)
                throw err
            })
        )
    }

    

/**
 * REVIEWS
*/


    public async fetchReviews(userId: number): Promise<Review[]> {
        try {
            return (
                await knex('reviews')
                .select('id', 'theme', 'presentation', 'creation_date')
                .where({user_id: userId})
            )
        }
        catch(err) { 
            console.log(err)
            throw err
        }
    }


    public async fetchOneReview(reviewId: number): Promise<Review> {
        try {
            const articles = (
                await knex('review_articles as articles')
                .select(
                    'articles.id', 'articles.title', 'articles.link', 'articles.image', 'articles.country', 'articles.publication_date', 'articles.description',
                )
                .where({review_id: reviewId})
                .whereNotNull('title')
                .union(
                    [
                        knex('review_articles')
                        .join(
                            'favorites as fav',
                            'review_articles.favorite_id', '=', 'fav.id'
                        )
                        .select(
                            'review_articles.id', 'fav.title', 'fav.link', 'fav.image', 'fav.country', 'fav.publication_date', 'fav.description',
                        )
                        .where({review_id: reviewId})
                    ]
                )
            )
            const review = await knex('reviews')
                    .select('user_id', 'theme', 'numero', 'presentation', 'image', 'creation_date')
                    .where({id: reviewId})
                    .first()
            review.articles = articles
            return review
        }
        catch (err) { 
            console.log(err); 
            throw err 
        }
    }


    public async createReview(review: Partial<ReviewInput>, userId: number): Promise<number> {
        try {
            return (
                await knex
                .insert({...review, user_id: userId})
                .into('reviews')
            )
        }
        catch(err) {
            console.log(err); 
            throw err 
        }
    }

    public async updateReview(id: number, properties: Partial<ReviewInput>): Promise<number> {
        try {
            return (
                await knex('reviews')
                .where({id: id})
                .update(properties)
            )
        }
        catch(err) {
            console.log(err); 
            throw err 
        }
    }

    public async deleteReview(reviewId: number): Promise<number> {
        try {
            return (
                await knex('reviews')
                .del()
                .where({id: reviewId})
            )
        }
        catch (err) { 
            console.log(err); 
            throw err 
        }
    }

    public async createArticle(article: Article|number, reviewId: number): Promise<number[]> {
        let insert = isNaN(article as number) ? article as Article : {favorite_id: article as number}
        try {
            return (
                await knex
                .insert({review_id: reviewId, ...insert})
                .into('review_articles')
            )
        }
        catch(err) {
            console.log(err); 
            throw err 
        }
    }

    public async deleteArticles(idList: number[], reviewId: number) {
        try {
            return (
                await knex('review_articles')
                .del()
                .where((k) => {
                    k.where({id: idList[0]})
                    for (let i = 1; i < idList.length; i++){
                        if (idList[i]) k.orWhere({id: idList[i]})
                    }
                })
                .andWhere({review_id: reviewId})
            )
        }
        catch(err) {
            console.log(err); 
            throw err 
        }
    }

    public async fetchFeed(friends: number[]) {
        try {
            return (
                await knex('reviews')
                .select('id', 'theme', 'presentation', 'creation_date')
                .where((k) => {
                    k.where({user_id: friends[0]})
                    for (let i = 1; i < friends.length; i++){
                        if (friends[i]) k.orWhere({user_id: friends[i]})
                    }
                })
                //.andWhere('creation_date', '>', '2023-01-01')
            )
        }
        catch(err) { 
            console.log(err)
            throw err
        }
    }



}   