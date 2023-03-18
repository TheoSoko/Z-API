import { UserType } from '../types/queryTypes'
import { UnkownIterable } from '../types/types'
import User from '../models/userModel'

type Prop<T> = keyof T
type Option<T> = T[keyof T]
type ValidateFunctions = { 
    [key: string] : checkFunc 
}
type checkFunc = (inputValue: string, propertyName: string, optionValue: any) => string | void
type ValidationModel = {
    [property: string] : {
        [option: string] : string | number | RegExp | boolean
    }
}

export default class Validation  {

    //Dictionnaire des fonctions 
    public validateFunctions:ValidateFunctions = {
        'maxLength': this.checkMaxLength,
        'regex': this.checkRegex,
        'required': () => {}
    }

    // Fonctions de validation individuelle
    private checkMaxLength (value:string, name: string, max: number): string | void{
        if (value && value.length > max){
            return `Le champs "${name}" ne doit pas dépasser ${max} caractères`
        }
    }
    private checkRegex (value:string, name: string, regex:RegExp): string | void {
        if (value && !value.match(regex)){
            return `Le champs "${name}" est invalide`
        }
    }

    // Modèles de validation création utilisateur
    public createUserValidation = {
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

    private updateUserValid = () => {
        type Key = keyof typeof this.createUserValidation;
        let obj = this.createUserValidation 
        for (const fieldName in obj){
            let properties = obj[fieldName as Key]
            let propPartial = properties as Partial<typeof properties>
            delete propPartial?.required
        }
        return obj
    }

    public updateUserValidation = this.updateUserValid()


    public validator = (input: UnkownIterable, validMod:ValidationModel):string[] => {
        let errors:string[] = []
        type modelKeys = keyof typeof validMod

        for (const fieldName in validMod){
            let options = validMod[fieldName as modelKeys]
            if (options['required'] && input[fieldName] == undefined){
                errors.push(`Le champs "${fieldName}" est requis`)
                continue;
            }
            if (input[fieldName] !== undefined && typeof input[fieldName] !== 'string'){
                errors.push(`Le champs "${fieldName}" est mal formaté`)
                continue;
            }
            let value = input[fieldName] as string
            // ♪ ♫ ♪
            for (const option in options){         
                let func = this.validateFunctions[option]
                let err:string | void = func(value, fieldName, options[option])
                err && errors.push(err)
            }
            // ♪ ♫ ♪
        }

        for (const field in input){
            !validMod[field] && errors.push(`Le champs ${field} n'est pas sensé exister`)
        }
    
        return errors
    }

}