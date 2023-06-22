
#  About

This is a RESTful web API built for interfacing with the Zemus mobile application.

The product has two main aspects:
- A social media platform
- A tool to search for news from the entire world. 


The environment mainly consists of Node, TypeScript, Hapi, Knex.

This project is the main building block of the Zemus backend application, and is deployed on a cloud instance, running on Debian.

## Tech Stack

**Language :** TypeScript

**Runtime** : Node.js

**HTTP framework :** [Hapi](https://hapi.dev)

**Authentication :** [Hapi/jwt](https://hapi.dev/module/jwt)

**SQL query builder :** [Knex.js](https://knexjs.org/)

**Process manager (production) :** [PM2](https://pm2.keymetrics.io/)


## Running the server

Install dependencies
```
  npm install
```

### Locally
Start the server with npm script
```
  npm run build
```
The transpilation to JS before the project builds and runs happens "under the hood", thanks to nodemon and ts-node. 

### On server
```
  npm run prod-js
```


## API reference

### Entry point :
- URL: ```http://api.zemus.info```
- IPv4: ```162.19.92.192```
- Port: ```80```


### Endpoints :
On all endpoints except mentionned :
- **Accept**: application/json, application/x-www-form-urlencoded 
- ***headers***: "Authorization": "bearer __* actual token *__"
- All query or body parameter followed by a __"?"__ is optionnal


#### Auth :
- ```POST /sign-in``` <br/> 
    - ***payload***: {email: jean@dujardin.fr, password: mdp1234!}
- ```HEAD | GET /auth``` <br/> 
    - ***query***: ?id=7
    - ***headers***: Authorization: bearer __* actual token *__
    
#### Search :
- ```GET /search``` <br/> 
    - ***query***: 
    <br/>- ?q=football
    <br/>- &country=FR
    <br/>- &src=journals, 
    - ***no auth needed*** 
    
#### Users :
- ```GET /users/{id}```
- ```DELETE /users/{id}```
- ```POST /users``` <br/> 
    - ***payload***: 
    <br/>- {firstname, lastname, email, password, country}
- ```PATCH /users/{id}``` <br/> 
    - ***payload***: 
    <br/>- {firstname, lastname, email, password, country}

#### Friends :
- ```GET /users/{id}/friends```
- ```DELETE /users/{id}/friends/{id}```
- ```PUT /users/{id}/friends/{id}``` <br/> 
- ```GET /users/{id}/friends/{id}``` <br/> 

#### favorites :
- ```GET /users/{id}/favorites```
- ```GET /favorites/{favoritesId}```
- ```DELETE /favorites/{favoritesId}```
- ```POST /users/{id}/favorites``` <br/> 
    - ***payload***: 
    <br/>- {title, link, image?, country, publication_date, description}








### Infos pratiques

Le projet est situé dans ```/srv/zemus-api``` sur le serveur.

Le process lié au service est relancé au démarrage du serveur, grâce à PM2.

__Pour transpiler le projet dans build (en prod) :__
```tsc --project tsconfig.production.json```
