import { UserType } from '../types/classTypes'
import User from '../models/userModel'

type Prop<T> = keyof T
type Option<T> = T[keyof T]
type Iterable = { [key: string] : any }
type checkFunc = (inputValue: string, property: string, optionValue: any) => boolean
type ValidationModel = {
    [property: string] : {
        [option: string] : string | number | RegExp | boolean
    }
}

export default class Validation  {

    //Dictionnaire des fonctions 
    public validateFunctions:Iterable = {
        'maxLength': this.checkLength,
        'regex': this.checkRegex
    }

    // Fonctions de validation individuelle
    private checkLength (value: string, prop: string, max: number): string | void{
        if (value.length > max){
            return `Le champs ${prop} ne doit pas dépasser ${max} caractères`
        }
    }
    private checkRegex (value:string, prop: string, regex:RegExp): string | void {
        if (!value.match(regex)){
            return `Le champs ${prop} est invalide`
        }
    }

    // Propriétés utilisateur
    public userValidation = {
        firstname: {
            required: true,
            maxLength: 255,
        },
        lastname: {
            required: true,
            maxLength: 255,
        },
        email: { regex: /^[\w-\.]{1,64}@[\w-]{1,251}\.[\w-]{2,4}$/ },
        password: { regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&µ£\/\\~|\-])[\wÀ-ÖØ-öø-ÿ@$!%*#?&µ£\/\\~|\-]{8,70}$/ },
        country: { required: true},
    }

 

    public validator = (input: UserType, validationModel:ValidationModel):string[] => {
        let errors:string[] = []
        let expected = validationModel

        for (const key in expected){
            let prop = expected[key as Prop<typeof expected>]
            if (key in input){
                // ♪ ♫ ♪
                for (const option in prop){
                    let func:checkFunc = this.validateFunctions[option]
                    if (func !== undefined){ // pour les required
                        let err = func(input[key], key, prop[option as Prop<typeof prop>])
                        err && errors.push(String(err))
                    }
                }
                // ♪ ♫ ♪
            } else {
                'required' in prop && errors.push(`Le champs ${prop} est requis.`)
            }
        }
        return errors
    }

}