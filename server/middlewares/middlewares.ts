import db from '../db/knex'

export async function checkDb(){
    return await db.raw('select 1 + 1;').catch(() => null)

}
