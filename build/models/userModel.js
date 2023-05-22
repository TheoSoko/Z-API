"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("../db/knex"));
const constants_1 = require("../constants/constants");
class User {
    async create(properties) {
        return new Promise(async (success, failure) => {
            try {
                success(await knex_1.default.insert(properties).into('users'));
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async fetch(id, basicInfo) {
        let fields = basicInfo
            ? ['id', 'lastname', 'firstname', 'profile_picture']
            : ['id', 'lastname', 'firstname', 'email', 'profile_picture', 'country'];
        return new Promise(async (success, failure) => {
            try {
                const res = await knex_1.default.select(fields)
                    .from('users')
                    .where({ id: id })
                    .first();
                success(res);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async fetchByEmail(email, idOnly) {
        let fields = idOnly ? ['id'] : ['id', 'password', 'lastname', 'firstname', 'email', 'profile_picture', 'country'];
        try {
            let resp = await (0, knex_1.default)('users')
                .select(fields)
                .where({ email: email })
                .first()
                .then((res) => res);
            return new Promise(success => success(resp));
        }
        catch (err) {
            console.log(err);
            return new Promise((_, fail) => fail(err));
        }
    }
    async update(id, payload) {
        return new Promise(async (success, failure) => {
            try {
                const res = await (0, knex_1.default)('users')
                    .where({ id: id })
                    .update(payload)
                    .then((affectedRows) => affectedRows);
                success(res);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async delete(id) {
        return new Promise(async (success, failure) => {
            try {
                success(await (0, knex_1.default)('users')
                    .where({ id: id })
                    .del());
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    /**
     * MESSAGES
    */
    async fetchMessages(id, friendId) {
        return new Promise(async (success, failure) => {
            try {
                const res = await knex_1.default
                    .select('id', 'user_sender_id', 'user_receiver_id', 'friendship_id', 'content', 'created_at')
                    .from('messages')
                    .where({ user_sender_id: id, user_receiver_id: friendId })
                    .orWhere({ user_sender_id: friendId, user_receiver_id: id });
                success(res);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async postMessage(id, friendId, content) {
        return new Promise(async (success, failure) => {
            try {
                const res = await (0, knex_1.default)('messages')
                    .insert({
                    content: content,
                    user_sender_id: id,
                    user_receiver_id: friendId
                });
                success(res);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    /**
     * FEED
    */
    async fetchFeed(friends, page) {
        try {
            let reviews = (await (0, knex_1.default)('reviews')
                .select('reviews.id', 'reviews.theme', 'reviews.presentation', 'reviews.creation_date', 'user_id', 'reviews.visibility_id')
                .where('visibility_id', '>=', constants_1.visibility['friends'])
                .andWhere((k) => {
                var _a;
                k.andWhere({ user_id: (_a = friends[0]) !== null && _a !== void 0 ? _a : 0 }); // A voir, si l'utilisateur n'a pas d'amis il récupère les revues de l'user 1
                for (let i = 1; i < friends.length; i++) {
                    if (friends[i])
                        k.orWhere({ user_id: friends[i] });
                }
            })
                .limit(50)
                .offset((page - 1) * 50)
                //.andWhere('creation_date', '>', '2023-01-01')
                .orderBy('creation_date', 'desc'));
            // Si pas de revues pour le feed
            if (reviews.length == 0) {
                return [];
            }
            const articles = (await (0, knex_1.default)('review_articles as articles')
                .select('articles.image', 'articles.country', 'articles.review_id')
                .where((k) => {
                k.where({ review_id: reviews[0].id });
                for (let i = 1; i < reviews.length; i++) {
                    if (reviews[i])
                        k.orWhere({ review_id: reviews[i].id });
                }
            })
                .whereNotNull('title')
                .union((0, knex_1.default)('review_articles')
                .select('fav.image', 'fav.country', 'review_articles.review_id')
                .join('favorites as fav', 'review_articles.favorite_id', '=', 'fav.id')
                .where((k) => {
                var _a;
                k.where({ review_id: (_a = reviews[0].id) !== null && _a !== void 0 ? _a : 0 });
                for (let i = 1; i < reviews.length; i++) {
                    if (reviews[i])
                        k.orWhere({ review_id: reviews[i].id });
                }
            })));
            //add articles (array) property to each review
            reviews = reviews.map(rev => { return { ...rev, articles: [] }; });
            //If articles.review_id = review.id : push article in review.articles
            articles.forEach((article) => {
                let revId = article.review_id;
                reviews.forEach((review) => {
                    if (review.id == revId)
                        review.articles.push(article);
                });
            });
            return new Promise(success => success(reviews));
        }
        catch (err) {
            console.log(err);
            return new Promise((_, failure) => failure(err));
        }
    }
}
exports.default = User;
