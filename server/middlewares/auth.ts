import {Request, ResponseToolkit} from '@hapi/hapi'
import Jwt, { HapiJwt } from '@hapi/jwt'
type Artifacts = HapiJwt.Artifacts
//import * as fs from 'fs/promises'
//keys: async () => fs.readFile('../key/key.txt'),


//  Important ! 
//  Pour toutes les routes comprenant un paramètre "{id}", celui-ci se réfère à l'id utilisateur
//  Celà nous permet de vérifier dans authParams.validate si ({id} dans route) == (Sujet du token)

// Note :
// Hapi/jwt vérifie le token à partir du moment ou la premiète section du chemin (e.g /users/) matche un endpoint, 
// même si la méthode http n'est pas supportée, ou si l'url n'existe pas, résultant en de mauvais status d'erreur (401 au lieu de 404 / 405)


export const authParams = {
    keys: 'Coffee Pot',
    verify: {
        aud: 'api.zemus.info',
        iss: 'api.zemus.info',
        sub: false,
        nbf: true,
        exp: true,
        maxAgeSec: 36000, // 10 heures
    },
    validate: (artifacts: Artifacts, request: Request, reply: ResponseToolkit) => {
        let sub = artifacts.decoded.payload.sub //subject
        let userId = request.params?.id
        if (userId != undefined && sub !== userId){  // (Sujet du token) !== ({id} dans route) 
            return {
                isValid: false,
                response: reply.response({
                    statusCode: 403,
                    error: 'Forbidden',
                    message: 'L\'utilisateur à qui appartient le token envoyé n\'est pas le même que celui identifié par l\'URL actuelle',
                })
                .code(401)
            }
        }
        return {
            isValid: true,
            credentials: artifacts.decoded.payload
        }
    }
}


export function generateToken(userId: number | string, email: string): string{
    const token = Jwt.token.generate(
        {
            iss: 'api.zemus.info',
            aud: 'api.zemus.info',
            sub: String(userId),
            userEmail: email,
        }
        , 'Coffee Pot'
    )
    return token
}


