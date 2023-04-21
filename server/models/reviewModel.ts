import knex from '../db/knex'
import { ReviewType, ReviewInput, Article } from '../types/types'


export default class Review {

    public async fetchAll(userId: number): Promise<ReviewType[]> {
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


    public async fetchOne(reviewId: number): Promise<ReviewType> {
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


    public async create(review: Partial<ReviewInput>, userId: number): Promise<number> {
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

    public async update(id: number, properties: Partial<ReviewInput>): Promise<number> {
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


    public async delete(reviewId: number): Promise<number> {
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

}