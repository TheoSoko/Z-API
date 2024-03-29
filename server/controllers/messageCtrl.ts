import User from '../models/userModel'
import Errors from '../errorHandling/errorDictionary'
import { Message } from '../types/types'
import { Request, ResponseToolkit } from '@hapi/hapi'
import validator from "validator"


export default class MessageController {

    public async getMessages(req:Request){
        const id = req.params?.id
        const friendId = req.params?.friendId
        if (!id || !friendId) return Errors.no_id_friends
        
        const user = new User()
        const messages = await user.fetchMessages(id, friendId).catch(() => null)
        if (messages === null){
            return Errors.no_payload
        }

        // Tri des messages entre "envoyés" et "reçus"
        let sent = []
        let received = []
        for (const msg of messages){
            if (id == msg.user_sender_id){
                sent.push(msg); continue
            }
            received.push(msg)
        }

        return {
            sent: sent,
            received: received
        }
    }

    public async sendMessage(req:Request, reply:ResponseToolkit){
        const id = req.params.id
        const friendId = req.params.friendId
        const content = (req.payload as Message)?.content

        if (!id || !friendId) return Errors.no_id_friends
        if (!content) return Errors.no_payload

        validator.escape(content)
        
        return new User().postMessage(id, friendId, content)
            .then(() => reply.response({newMessage: content}).code(201))
            .catch((err:{code:string}) => Errors[err.code] || Errors.unidentified)
    }

}
