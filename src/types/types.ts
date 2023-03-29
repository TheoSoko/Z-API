export type SearchValues = {
    q: string | null,
    country: string | null,
    image: boolean | null,
    sort: string | null
}

export type FriendShip = {
    //id: number
    user1_id: number
    user2_id: number
    confirmed: number //boolean, sort of 	
    date: Date | string
}


export type UnkownIterable = {[key:string] : unknown}

export type ValidationModel = {
    [property: string] : {
        [option: string] : string | number | RegExp | boolean
    }
}

type Prop<T> = keyof T
type Option<T> = T[keyof T]
