import db from '../db/knex'
import Errors from '../errorHandling/errorDictionary'
import {Request, ResponseToolkit} from '@hapi/hapi'

export async function checkDb(_: Request, h: ResponseToolkit){
    try {
        await db.raw('select 1 + 1;')
        return h.continue
    }
    catch (err) {
        console.log("err at db check", err)
        throw Errors.db_unavailable
    }
}
