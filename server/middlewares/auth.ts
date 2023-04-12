import {Request, ResponseToolkit} from '@hapi/hapi'
import Jwt, { HapiJwt } from '@hapi/jwt'
type Artifacts = HapiJwt.Artifacts
import * as fs from 'fs/promises'
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
    validate: (artifacts:Artifacts, request: Request, h: ResponseToolkit) => {
        return {
            isValid: true,
            credentials: { user: artifacts.decoded.payload }
        }
    }
}

export function generateToken(id: number | string, email: string): string{
    const token = Jwt.token.generate(
        {
            iss: 'api.zemus.info',
            aud: 'api.zemus.info',
            sub: String(id),
            userEmail: email,
        }
        , 'Coffee Pot'
    )
    return token
}


