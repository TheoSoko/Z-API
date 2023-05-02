import {Request, ResponseToolkit} from '@hapi/hapi'
import { SearchValues } from '../types/types'
import boom from '@hapi/boom'
import http from 'http'
import jsdom from 'jsdom'
const { JSDOM } = jsdom;

export default async function search(request: Request, reply: ResponseToolkit){

    let searchValues:SearchValues = {
        q : null,
        country : null,
        image : null,
        sort : null
    }

    let query = request.query?.q
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
        http.get('http://127.0.0.1:9090/renderer?use=Index+1+test&name=default&query=' + query, (res) => {
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
    const htmlResults = dom.window.document.getElementsByClassName("osscmnrdr oss-result")
    let elementList = []
    for (const name in htmlResults) {
        if (name == "HTMLDivElement") elementList.push(htmlResults[name])
        
    }


    return reply.response(elementList).code(200)


//body>div>id=oss-main(3rd)>id=oss-result(4th)> ossfieldrdr 1(title)->2(url)->3(desc)

/*
    let searchResults = {
        requestInfo: searchValues,
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
*/
}