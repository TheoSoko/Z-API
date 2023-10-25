"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("../db/knex"));
class Favorite {
    async fetchAll(userId) {
        return new Promise(async (success, failure) => {
            try {
                let response = await knex_1.default
                    .select('id', 'title', 'link', 'image', 'country', 'publication_date', 'description')
                    .from('favorites')
                    .where({ user_id: userId })
                    .orderBy('publication_date', 'desc');
                success(response);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async fetchOne(favoriteId) {
        return new Promise(async (success, failure) => {
            try {
                let response = await knex_1.default
                    .select('id', 'user_id', 'title', 'link', 'image', 'country', 'publication_date', 'description')
                    .from('favorites')
                    .where({ id: favoriteId })
                    .first();
                success(response);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async delete(favoriteId) {
        return new Promise(async (success, failure) => {
            try {
                let response = await (0, knex_1.default)('favorites')
                    .del()
                    .where({ id: favoriteId })
                    .catch((err) => {
                    console.log(err);
                    throw err;
                });
                success(response);
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
    async create(properties) {
        return new Promise(async (success, failure) => {
            try {
                success(await (0, knex_1.default)('favorites')
                    .insert(properties));
            }
            catch (err) {
                console.log(err);
                failure(err);
            }
        });
    }
}
exports.default = Favorite;
