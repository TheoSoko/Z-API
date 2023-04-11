import db from '../db/connection'

export async function checkDb(){
    return await db.raw('select 1+1 as result').catch(() => null)

}
