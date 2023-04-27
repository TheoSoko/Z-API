export type SearchValues = {
    q: string | null,
    country: string | null,
    image: boolean | null,
    sort: string | null
}

export type UserType = {
    id: number | number
    firstname: string
    lastname: string
    email: string
    password: string
    country: string
    fiendShip: {
        id: number
        user1Id: number
        user2Id: number
        confirmed: boolean 	
        date: Date | string
      }

}

export type FriendShip = {
    //id: number
    user1_id: number
    user2_id: number
    confirmed: number //boolean, sort of 	
    date: Date | string
}

export type Message = {
    id: number
    user_sender_id: number
    user_receiver_id: number
    friendship_id: number
    content: string  // A voir plus tard
    created_at: Date | string
}

export type Favorite = {
    id: number
    user_id: number
    title: string
    link: string
    image: string
    country: string
    publication_date: Date | string
    description: string
}

export type Article = {
    id_revue?: number
    title: string
    link: string
    image: string | null
    country: string
    publication_date: Date | string
    description: string 	
}

export type ReviewType = {
    id: number
    user_id: number
    theme: string
    presentation: string
    creation_date: string
    description: string
    image: string
    articles: string 
}

export type ReviewInput = {
    user_id: number
    theme: string
    presentation: string
    creation_date: string
    description: string
    image: string
    articles: (number|Article)[] // (FavoriteId | Article) [] 
}



export type UnkownIterable = {[key:string] : unknown}

export type ValidationModel = {
    [property: string] : {
        [option: string] : string | number | RegExp | boolean | undefined
    }
}

type Prop<T> = keyof T
type Option<T> = T[keyof T]
