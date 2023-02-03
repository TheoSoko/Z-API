import {Request, ResponseToolkit} from '@hapi/hapi'
import { searchQueryValues } from '../types/allTypes'

export function search(request: Request, h: ResponseToolkit){

    let queryValues:searchQueryValues = {
        q : null,
        country : null,
        image : null,
        sort : null
    }

    for (const property in request.query){
        if (queryValues.hasOwnProperty(property)){
            queryValues[property as keyof searchQueryValues] = request.query[property]
        }
    }

    let searchResults = {
        originalRequestInfo: queryValues,
        results: 
            [
                {
                    title: 'Le prix de la vie en baisse en 2023',
                    url: 'www.lesvraiesinfos.fr',
                    description: 'Le coût des consommations du quotidien blabla...'
                }
            ]
    }

    return h.response(searchResults).code(200)
}