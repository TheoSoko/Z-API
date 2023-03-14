import zemusDb from '../db/dbConnection'
import { UserType } from '../types/classTypes'


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
            .then((result: typeof User) => result)
            .catch((err:Error) => { 
                console.log(err)
                throw err 
            })
        )
    }
    

    

}   