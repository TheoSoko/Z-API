
  export interface UserInput {
    id?: number
    firstname: string
    lastname: string
    email: string
    password: string
    country: string
    /* 
    fiendShip: {
      id: number
      user1Id: number
      user2Id: number
      confirmed: boolean 	
      date: Date | string
    }
    */
    //[Symbol.iterator]: () => any
    //createUser: () => UserType
    [key: string | number]: any
  }
  


