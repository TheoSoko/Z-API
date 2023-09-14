import { UnkownIterable, ValidationModel } from '../types/types'
import validator from 'validator'

type checkFunc = (inputValue: string, propertyName: string, optionValue: any) => string | void
type ValidateFunctions = {
    [key: string] : checkFunc 
}


export default class Checker  {

    //Dictionnaire des fonctions 
    public validateFunctions: ValidateFunctions = {
        'required': () => {},
        'maxLength': this.checkMaxLength,
        'regex': this.checkRegex,
        'date': this.checkIsDate,
        'isInt': this.checkIsInt,
    }

    // Fonctions de validation individuelles
    private checkMaxLength (value: string, name: string, max: number): string | void{
        if (value && value.length > max){
            return `Le champs "${name}" ne doit pas dépasser ${max} caractères`
        }
    }
    private checkRegex (value: string, name: string, regex: RegExp): string | void {
        if (value && !value.match(regex)){
            return `Le champs "${name}" est invalide`
        }
    }
    private checkIsDate (value: string, name: string, option: unknown): string | void {
        const [date, time] = value.split(' ')
        if (!validator.isDate(date)){
            return `Le champs "${name}" doit être une date valide (YYYY-MM-DD hh:mm:ss)`
        }
        if (!validator.isTime(time, {mode: 'withSeconds'})){
            return `Le champs "${name}" doit être une date valide (YYYY-MM-DD hh:mm:ss)`
        }
    }
    private checkIsInt (value: string, name: string): string | void {
        if (!validator.isInt(value)){
            return `Le champs "${name}" doit être un nombre entier`
        }
    }



    public check (input: unknown, validMod:ValidationModel):string[] {
        let errors:string[] = []

        if (typeof input !== 'object') return ['Le corps de la requête doit être un objet JSON']
        let json = input as UnkownIterable

        for (const fieldName in validMod){
            let options = validMod[fieldName]
            
            if (options['required'] && json[fieldName] == undefined){
                errors.push(`Le champs "${fieldName}" est requis`)
                continue;
            }

            if (json[fieldName] == undefined) {
                //console.log('Champs ' + fieldName + ' indéfini. Ignoré.')
                continue;
            }

            if (typeof json[fieldName] !== 'string'){
                console.log('Champs ' + fieldName + ' n\'est pas une chaine, ignoré.')
                continue;
            }

            let value = json[fieldName] as string

            if (value.length == 0 ){
                errors.push(`Le champs "${fieldName}" ne peut pas être une chaine vide`)
                continue;
            }

            // Empty options
            // In case of json[fieldName] == array or other, the options should always be an empty. So you just check the existence of the property.
            // If you wanna check a property that's an object, use another validation model and call Checker.check again, separately.
            // For an array, just do it yourself, dummy.
            if (Object.keys(options).length == 0){
                console.log('Pas d\'option pour ' + fieldName)
                continue;
            }

            // ♪ ♫ ♪
                for (const option in options){
                    let func = this.validateFunctions[option]
                    if (!func) continue
                    let err: string | void = func(value, fieldName, options[option])
                    err && errors.push(err)
                }
            // ♪ ♫ ♪
        }

        for (const field in input){
            !validMod[field] && errors.push(`Le champs ${field} n'est pas sensé exister`)
        }
    
        return errors
    }


    public sanitize (payload: UnkownIterable){
        for (let item in payload){
            if (this.notToEscape[item] || typeof payload[item] != "string"){
                continue
            }
            payload[item] = validator.escape(payload[item] as string)
        }
    }
    
    private notToEscape: {[key: string]: boolean} = {
        "password": true,
        "articles": true
    }

}