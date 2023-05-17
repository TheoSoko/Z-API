import knex from '../db/knex'
import { ReviewType, ReviewInput, Article } from '../types/types'
import { visibility } from '../constants/constants'

export default class Review {

    public async fetchAll(userId: number, mode: 'private' | 'friends' | 'public'): Promise<ReviewType[]> {
        let vFriends = visibility['friends']
        let vPublic = visibility['public']

        try {
            const res = await knex('reviews')
            .select (
                'id', 'theme', 'presentation', 'creation_date'
            )
            .where(k => {
                k.where({user_id: userId})
                if (mode == 'friends') k.andWhere('visibility_id', '>=', vFriends)
                if (mode == 'public') k.andWhere('visibility_id', '>=', vPublic)
            })
            return new Promise(success => success(res))
        }
        catch(err) { 
            return new Promise((_, fail) => { 
                console.log(err) 
                fail(err) 
            })
        }
    }


    public async fetchOne(reviewId: number): Promise<ReviewType | void> {
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
            let review = await knex('reviews')
                    .select('user_id', 'visibility_id','theme', 'numero', 'presentation', 'image', 'creation_date')
                    .where({id: reviewId})
                    .first()
            if (!review) {
                return new Promise((success) => success(undefined))
            }
            review.articles = articles
            return new Promise((success) => success(review))
        }
        catch (err) { 
            console.log(err)
            return new Promise((_, fail) => fail(err))
        }
    }

    public async fetchOneBasic(reviewId: number): Promise<ReviewType | void> {
        try {
            const res = await knex('reviews')
                .select('user_id', 'visibility_id')
                .where({id: reviewId})
                .first()
            return Promise.resolve(res)
        }
        catch (err){
            console.log(err)
            return Promise.reject(err)
        }
    }


    public async create(review: Partial<ReviewInput>, userId: number): Promise<number> {
        try {
            const res = await knex
                .insert({...review, user_id: userId})
                .into('reviews')
            return new Promise(success => success(res[0]))
        }
        catch(err) {
            return new Promise((_, fail) => { 
                console.log(err); fail(err) 
            })
        }
    }

    public async update(id: number, properties: Partial<ReviewInput>): Promise<number> {
        try {
            const res =  await knex('reviews')
                .where({id: id})
                .update(properties)
            return new Promise(success => success(res))
        }
        catch(err) {
            return new Promise((_, fail) => { 
                console.log(err)
                fail(err) 
            })
        }
    }


    public async delete(reviewId: number): Promise<number> {
        try {
            const res =  await knex('reviews')
                .del()
                .where({id: reviewId})
            return new Promise(success => success(res))
        }
        catch(err) {
            return new Promise((_, fail) => { 
                console.log(err)
                fail(err) 
            })
        }

    }

    
    public async createArticle(article: Article|number, reviewId: number): Promise<number[]> {
        let insert = isNaN(article as number) ? article as Article : {favorite_id: article as number}
        try {
            const res = await knex
                .insert({review_id: reviewId, ...insert})
                .into('review_articles')
            return new Promise(success => success(res))
        }
        catch(err) {
            return new Promise((_, fail) => { 
                console.log(err)
                fail(err) 
            })
        }

    }

    public async deleteArticles(idList: number[], reviewId: number) : Promise<number> {
        try {
            const res =  (
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
            return new Promise(success => success(res))
        }
        catch(err) {
            return new Promise((_, fail) => {
                console.log(err)
                fail(err)
            })
        }
    }

}