import Knex from 'knex'

const knex = Knex({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'root',
      password : '',
      database : 'zemus_prem'
    }
  })
  
  
  export default knex