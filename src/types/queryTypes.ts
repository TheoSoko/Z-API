
  export interface UserType {
    id?: number
    firstname: string
    lastname: string
    email: string
    password: string
    country: string
    [key: string | number]: any
    //[Symbol.iterator]: () => any
    //createUser: () => UserType
  }
  


