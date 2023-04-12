import {Request, ResponseToolkit} from '@hapi/hapi'
import { SearchValues } from '../types/types'

export default function search(request: Request, h: ResponseToolkit){

    let searchValues:SearchValues = {
        q : null,
        country : null,
        image : null,
        sort : null
    }

    for (const property in request.query){
        if (searchValues.hasOwnProperty(property)){
            searchValues[property as keyof SearchValues] = request.query[property]
        }
    }

    let searchResults = {
        originalRequestInfo: searchValues,
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