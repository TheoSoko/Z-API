import db from '../db/knex'
import Errors from '../errorHandling/errorDictionary'

export async function checkDb(){
    try {
        await db.raw('select 1 + 1;')
        return true
    }
    catch (err){
        console.log(err)
        throw Errors.db_unavailable
    }
}
