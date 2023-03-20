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

    static updateUserValid = () => {
        type Key = keyof typeof ValidationModels.createUser;
        let obj = ValidationModels.createUser 
        for (const fieldName in obj){
            let properties = obj[fieldName as Key]
            let propPartial = properties as Partial<typeof properties>
            delete propPartial?.required
        }
        return obj
    }

    static updateUser = ValidationModels.updateUserValid()


}
