"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = __importDefault(require("../errorHandling/validation"));
const validationModels_1 = __importDefault(require("../errorHandling/validationModels"));
const boom_1 = __importDefault(require("@hapi/boom"));
const axios_1 = __importDefault(require("axios"));
async function search(request, reply) {
    if (!request.query)
        return boom_1.default.badData('Veuillez fournir les informations nécessaires à la recherche en paramètre d\'url');
    let errs = new validation_1.default().check(request.query, validationModels_1.default.search);
    if (errs.length > 0) {
        return reply.response({
            status: 420,
            message: "Les informations fournies en paramètre d\'url de sont pas valides",
            errorList: errs
        });
    }
    let search = request.query;
    let query = search.q;
    if (!query)
        return boom_1.default.badRequest('Veuillez fournir le texte à rechercher en paramètre d\'url');
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
    let index_name = encodeURIComponent('Index 1 test');
    let template_name = 'search';
    const body = JSON.stringify({ query: 'rugby' });
    const config = {
        method: 'POST',
        url: 'http://127.0.0.1:9090/services/rest/index/' + index_name + '/search/field/' + template_name,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Host': '127.0.0.1',
        },
        data: body,
    };
    let response = await (0, axios_1.default)(config)
        .catch((err) => { console.log(err.response); return null; });
    if (!response) {
        return 'pas de réponse';
    }
    console.log(response);
    return '*fart noises*';
    let jsonArray = [];
    let searchResults = {
        requestInfo: search,
        results: jsonArray
    };
    //test
}
exports.default = search;
