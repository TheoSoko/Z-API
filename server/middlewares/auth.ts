import {Request, ResponseToolkit} from '@hapi/hapi'
import Jwt, { HapiJwt } from '@hapi/jwt'
type Artifacts = HapiJwt.Artifacts
//import * as fs from 'fs/promises'
//keys: async () => fs.readFile('../key/key.txt'),


export const authParams = {
    keys: 'Coffee Pot',
    verify: {
        aud: 'api.zemus.info',
        iss: 'api.zemus.info',
        sub: false,
        nbf: true,
        exp: true,
        maxAgeSec: 18000, // 5 heures
    },
    validate: (artifacts: Artifacts, request: Request, reply: ResponseToolkit) => {
        let sub = artifacts.decoded.payload.sub //subject
        let userId = request.params.id
        if (userId !== undefined && sub !== userId){  // (Sujet du token) !== ({id} dans route) 
            return {
                isValid: false,
                response: reply.response({
                    statusCode: 401,
                    error: 'Unauthorized',
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


