"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("../db/knex"));
class Friend {
    async fetchAll(id) {
        try {
            const res = await (0, knex_1.default)('friendships')
                .select('user1_id', 'user2_id', 'confirmed', 'date')
                .where({ confirmed: true })
                .andWhere({ user1_id: id })
                .orWhere({ user2_id: id });
            return new Promise((success) => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err); });
        }
    }
    async add(id, friendId) {
        try {
            const res = await knex_1.default.insert({
                user1_id: id,
                user2_id: friendId
            })
                .into('friendships');
            return new Promise((success) => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err); });
        }
    }
    async fetchFriendship(id, friendId) {
        try {
            const res = await knex_1.default
                .select('user1_id', 'user2_id', 'confirmed', 'date')
                .from('friendships')
                .where({ user1_id: id, user2_id: friendId })
                .orWhere({ user1_id: friendId, user2_id: id })
                .first();
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err); });
        }
    }
    async accept(id, friendId) {
        try {
            const res = await (0, knex_1.default)('friendships')
                .update({ confirmed: true })
                .where({ user1_id: friendId, user2_id: id })
                .then((affectedRows) => affectedRows);
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err); });
        }
    }
    async remove(id, friendId) {
        try {
            const res = await (0, knex_1.default)('friendships')
                .del()
                .where({ user1_id: id, user2_id: friendId })
                .orWhere({ user1_id: friendId, user2_id: id })
                .then((affectedRows) => affectedRows);
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err); });
        }
    }
    async fetchInvitations(id) {
        try {
            const res = await (0, knex_1.default)('friendships')
                .join('users', 'users.id', '=', 'friendships.user1_id')
                .select('users.id', 'users.firstname', 'users.lastname', 'users.email', 'users.profile_picture', 'users.country')
                .where({ user2_id: id })
                .andWhere({ confirmed: false });
            return new Promise(success => success(res));
        }
        catch (err) {
            return new Promise((_, fail) => { console.log(err); fail(err); });
        }
    }
}
exports.default = Friend;
