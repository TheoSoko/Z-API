"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDb = void 0;
const knex_1 = __importDefault(require("../db/knex"));
const errorDictionary_1 = __importDefault(require("../errorHandling/errorDictionary"));
async function checkDb(_, h) {
    try {
        await knex_1.default.raw('select 1 + 1;');
        return h.continue;
    }
    catch (err) {
        console.log("err at db check", err);
        throw errorDictionary_1.default.db_unavailable;
    }
}
exports.checkDb = checkDb;
