import {Request, ResponseToolkit} from '@hapi/hapi'
import { SearchValues } from '../types/types'
import Checker from '../errorHandling/validation'
import ValidationModels from '../errorHandling/validationModels'
import boom from '@hapi/boom'
import http from 'http'
import jsdom from 'jsdom'
const { JSDOM } = jsdom;

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

    const ossData = new Promise <string> (async (success, failure) => {
        http.get('http://127.0.0.1:9090/renderer?use=Index+1+test&name=Rendu+Test+1&query=' + query, (res) => {
            let data = ''
            res.on('data', (dataChunk) => data += dataChunk )
            res.on('end', () => success(data) )
        })
        .on('error', (err) => failure(err.message))
    })
    

    let plainTextHtml = await ossData.catch((err) => {
        console.log(err)
        return null
    })
    if (!plainTextHtml) return boom.badImplementation('Le fetch de OSS a échoué')


    const dom = new JSDOM(plainTextHtml)
    const resultsDiv = dom.window.document.querySelector(".oss-result")
    let divList = resultsDiv?.getElementsByTagName("div")
    if (!divList) return boom.badImplementation()


    type ReponseElement = {
        title: string | null, 
        url: string | null, 
        description: string | null
    }

    let jsonArray: ReponseElement[] = []
    for (const div of divList) {
        let text = div.textContent ? div.textContent.trim() : null
        if (div.classList[1] == 'ossfieldrdr1') jsonArray.push({title: text, url: null, description: null})
        if (div.classList[1] == 'ossfieldrdr2') jsonArray[jsonArray.length - 1].url = text
        if (div.classList[1] == 'ossfieldrdr3') jsonArray[jsonArray.length - 1].description = text
    }


    let searchResults = {
        requestInfo: search,
        results: jsonArray
    }

    return reply.response(searchResults).code(200)

}