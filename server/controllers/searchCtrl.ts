import {Request, ResponseToolkit} from '@hapi/hapi'
import { SearchValues } from '../types/types'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import boom from '@hapi/boom'
import axios, { AxiosRequestConfig } from 'axios';



export default async function search(request: Request, reply: ResponseToolkit){

    if (!request.query) return boom.badData('Veuillez fournir les informations nécessaires à la recherche en paramètre d\'url')
    let errs = new Checker().check(request.query, ValidationModels.search)
    if (errs.length > 0){
        return reply.response({
            status: 420,
            message: "Les informations fournies en paramètre d\'url de sont pas valides",
            errorList: errs
        })
    }

    let search = request.query as SearchValues
    let query = search.q
    if (!query) return boom.badRequest('Veuillez fournir le texte à rechercher en paramètre d\'url')


/*
    const dataClosure = <T>(init?: T): [() => T|void, (arg:T) => void] =>  {
        let data = init
        const setData = (newData: T) => { data = newData }
        const getData = () => data 
        return [getData, setData]
    }

    const [getData, setData] = dataClosure<string>()
*/

/*
    // REST api version
    // http://127.0.0.1:9090/services/rest/index/Index 1 test/search/field/search
    {
        "successful": true,
        "documents": [
            {
                "pos": 0,
                "score": 2.0,
                "collapseCount": 0,
                "fields": [
                    {
                        "fieldName": "url",
                        "values": [ "https://www.lefigaro.fr/dossier/les-questions-du-jour-du-figaro" ]
                    },
                    {
                        "fieldName": "backlinkCount",
                        "values": [ ">0000000038" ]
                    },
                    {
                        "fieldName": "title",
                        "values": [ "La question du jour" ]
                    },
                    {
                        "fieldName": "metaDescription",
                        "values": [ "Blablabla ..." ]
                    }
                ],
                "snippets": [
                    {
                        "fieldName": "title",
                        "values": [ "La question du jour" ],
                        "highlighted": false
                    },
                    {
                        "fieldName": "fileName",
                        "values": [],
                        "highlighted": false
                    },
                    {
                        "fieldName": "content",
                        "values": [ "{Contenu comprenant les mots de la query }" ],
                        "highlighted": false
                    }
                ],
                "functions": [],
                "positions": []
            },
        ]
    }
*/

    let index_name  = encodeURIComponent('Index 1 test')
    let template_name = 'search'
    const body = JSON.stringify({query: 'rugby'})

    const config: AxiosRequestConfig = {
        method: 'POST',
        url: 'http://127.0.0.1:9090/services/rest/index/' + index_name + '/search/field/' + template_name,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Host': '127.0.0.1',
        },
        data: body,
      }

      let response = await axios(config)
      .catch((err) => { console.log(err.response); return null })

      if (!response){
        return 'pas de réponse'
      }

      console.log(response)





    return '*fart noises*'


    type ReponseElement = {
        title: string | null, 
        url: string | null, 
        description: string | null
    }

    let jsonArray: ReponseElement[] = []


    let searchResults = {
        requestInfo: search,
        results: jsonArray
    }

    //test

}