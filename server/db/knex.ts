import Knex from 'knex'

const dbConnection = {
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'root',
      password : '',
      database : 'zemus_api'
    }
}

const knex = Knex(dbConnection)

  
export default knex