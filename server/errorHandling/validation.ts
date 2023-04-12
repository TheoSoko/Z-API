import { UnkownIterable, ValidationModel } from '../types/types'

type checkFunc = (inputValue: string, propertyName: string, optionValue: any) => string | void
type ValidateFunctions = {
    [key: string] : checkFunc 
}


export default class Checker  {

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



    public check (input: UnkownIterable, validMod:ValidationModel):string[] {
        let errors:string[] = []
        for (const fieldName in validMod){
            let options = validMod[fieldName]
            
            if (options['required'] && input[fieldName] == undefined){
                errors.push(`Le champs "${fieldName}" est requis`)
                continue;
            }
            if (input[fieldName] !== undefined && typeof input[fieldName] !== 'string'){
                errors.push(`Le champs "${fieldName}" est mal formaté`)
                continue;
            }
            if (input[fieldName] === undefined) continue;

            let value = input[fieldName] as string
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

}