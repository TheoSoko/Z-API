"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDb = void 0;
const knex_1 = __importDefault(require("../db/knex"));
async function checkDb() {
    return await knex_1.default.raw('select 1 + 1;').catch(() => null);
}
exports.checkDb = checkDb;
