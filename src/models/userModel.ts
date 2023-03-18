import zemusDb from '../db/dbConnection'
import { UserType } from '../types/queryTypes'


export default class User implements UserType{

    id?: number
    firstname!: string
    lastname!: string
    email!: string
    password!: string
    country!: string

    constructor(properties?: any){
    }


    public async createUser(properties: UserType){
        return (
            await zemusDb.insert(
                properties,
            )
            .into('users')
            .then((result: typeof User.prototype) => result)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }

    public async fetchUser(id: number):Promise<typeof User.prototype | void>{
        return (
            await zemusDb.select('lastname', 'firstname', 'email', 'country')
                .from('users')
                .where({id: id})
                .first()
                .then((res: typeof User.prototype) => res)
                .catch((err:Error) => { 
                    console.log(err)
                    throw err 
                })
        )
    }
    
    public async fetchUserByEmail(email: string):Promise<typeof User.prototype | void>{
        return (
            await zemusDb.select('id')
                .from('users')
                .where({email: email})
                .first()
                .then((res: typeof User.prototype) => res)
                .catch((err:Error) => { 
                    console.log(err)
                    throw err 
                })
        )
    }

    public async updateUser(id:number, payload: Partial<UserType>):Promise<number>{
        return (
            await zemusDb('users')
            .where({id: id})
            .update(payload)
            .then((affectedRows: number) => affectedRows)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
    )
    }

}   