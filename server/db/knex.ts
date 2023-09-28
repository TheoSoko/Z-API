require("dotenv").config();
import Knex from 'knex'


const knex = Knex({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      port : parseInt(process.env.DB_PORT!),
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD || "",
      database : process.env.DB_DATABASE
    }
  })
  
  
  export default knex