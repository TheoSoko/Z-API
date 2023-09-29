"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("../db/knex"));
const constants_1 = require("../constants/constants");
class Review {
    async fetchAll(userId, mode) {
        let vFriends = constants_1.visibility['friends'];
        let vPublic = constants_1.visibility['public'];
        try {
            const res = await (0, knex_1.default)('reviews')
                .select('id', 'theme', 'presentation', 'creation_date')
                .where(k => {
                k.where({ user_id: userId });
                if (mode == 'friends')
                    k.andWhere('visibility_id', '>=', vFriends);
                if (mode == 'public')
                    k.andWhere('visibility_id', '>=', vPublic);
            });
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => {
                console.log(err);
                fail(err);
            });
        }
    }
    async fetchOne(reviewId) {
        try {
            const articles = (await (0, knex_1.default)('review_articles as articles')
                .select('articles.id', 'articles.title', 'articles.link', 'articles.image', 'articles.country', 'articles.publication_date', 'articles.description')
                .where({ review_id: reviewId })
                .whereNotNull('title')
                .union([
                (0, knex_1.default)('review_articles')
                    .join('favorites as fav', 'review_articles.favorite_id', '=', 'fav.id')
                    .select('review_articles.id', 'fav.title', 'fav.link', 'fav.image', 'fav.country', 'fav.publication_date', 'fav.description')
                    .where({ review_id: reviewId })
            ]));
            let review = await (0, knex_1.default)('reviews')
                .select('user_id', 'visibility_id', 'theme', 'numero', 'presentation', 'image', 'creation_date')
                .where({ id: reviewId })
                .first();
            if (!review) {
                return new Promise((success) => success(undefined));
            }
            review.articles = articles;
            return new Promise((success) => success(review));
        }
        catch (err) {
            console.log(err);
            return new Promise((_, fail) => fail(err));
        }
    }
    async fetchOneBasic(reviewId) {
        try {
            const res = await (0, knex_1.default)('reviews')
                .select('user_id', 'visibility_id')
                .where({ id: reviewId })
                .first();
            return Promise.resolve(res);
        }
        catch (err) {
            console.log(err);
            return Promise.reject(err);
        }
    }
    async create(review, userId) {
        try {
            const res = await knex_1.default
                .insert({ ...review, user_id: userId })
                .into('reviews');
            return new Promise(success => success(res[0]));
        }
        catch (err) {
            return new Promise((_, fail) => {
                console.log(err);
                fail(err);
            });
        }
    }
    async update(id, properties) {
        try {
            const res = await (0, knex_1.default)('reviews')
                .where({ id: id })
                .update(properties);
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => {
                console.log(err);
                fail(err);
            });
        }
    }
    async delete(reviewId) {
        try {
            const res = await (0, knex_1.default)('reviews')
                .del()
                .where({ id: reviewId });
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => {
                console.log(err);
                fail(err);
            });
        }
    }
    async createArticle(article, reviewId) {
        let insert = isNaN(article) ? article : { favorite_id: article };
        try {
            const res = await knex_1.default
                .insert({ review_id: reviewId, ...insert })
                .into('review_articles');
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => {
                console.log(err);
                fail(err);
            });
        }
    }
    async deleteArticles(idList, reviewId) {
        try {
            const res = (await (0, knex_1.default)('review_articles')
                .del()
                .where((k) => {
                k.where({ id: idList[0] });
                for (let i = 1; i < idList.length; i++) {
                    if (idList[i])
                        k.orWhere({ id: idList[i] });
                }
            })
                .andWhere({ review_id: reviewId }));
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => {
                console.log(err);
                fail(err);
            });
        }
    }
}
exports.default = Review;
