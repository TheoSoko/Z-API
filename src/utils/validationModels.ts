import { ValidationModel } from '../types/types'


export default class ValidationModels{

    // Modèles de validation création utilisateur
    static createUser = {
        firstname: {
            required: true,
            maxLength: 255,
        },
        lastname: {
            required: true,
            maxLength: 255,
        },
        email: {
            required: true,
            regex: /^[\w-\.]{1,64}@[\w-]{1,251}\.[\w-]{2,4}$/,
        },
        password: {
            required: true,
            regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&µ£\/\\~|\-])[\wÀ-ÖØ-öø-ÿ@$!%*#?&µ£\/\\~|\-]{8,100}$/ 
        },
        country: {
            required: true
        },
    }

    static updateUser = {
        firstname: {
            maxLength: 255,
        },
        lastname: {
            maxLength: 255,
        },
        email: {
            regex: /^[\w-\.]{1,64}@[\w-]{1,251}\.[\w-]{2,4}$/,
        },
        password: {
            regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&µ£\/\\~|\-])[\wÀ-ÖØ-öø-ÿ@$!%*#?&µ£\/\\~|\-]{8,100}$/ 
        },
        country: {
        },
    }


}
