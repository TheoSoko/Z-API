"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
class Checker {
    constructor() {
        //Dictionnaire des fonctions 
        this.validateFunctions = {
            'required': () => { },
            'maxLength': this.checkMaxLength,
            'regex': this.checkRegex,
            'date': this.checkIsDate,
            'isInt': this.checkIsInt,
        };
        this.notToEscape = {
            "password": true,
            "articles": true
        };
    }
    // Fonctions de validation individuelles
    checkMaxLength(value, name, max) {
        if (value && value.length > max) {
            return `Le champs "${name}" ne doit pas dépasser ${max} caractères`;
        }
    }
    checkRegex(value, name, regex) {
        if (value && !value.match(regex)) {
            return `Le champs "${name}" est invalide`;
        }
    }
    checkIsDate(value, name, option) {
        const [date, time] = value.split(' ');
        if (!validator_1.default.isDate(date)) {
            return `Le champs "${name}" doit être une date valide (YYYY-MM-DD hh:mm:ss)`;
        }
        if (!validator_1.default.isTime(time, { mode: 'withSeconds' })) {
            return `Le champs "${name}" doit être une date valide (YYYY-MM-DD hh:mm:ss)`;
        }
    }
    checkIsInt(value, name) {
        if (!validator_1.default.isInt(value)) {
            return `Le champs "${name}" doit être un nombre entier`;
        }
    }
    check(input, validMod) {
        let errors = [];
        if (typeof input !== 'object')
            return ['Le corps de la requête doit être un objet JSON'];
        let json = input;
        for (const fieldName in validMod) {
            let options = validMod[fieldName];
            if (options['required'] && json[fieldName] == undefined) {
                errors.push(`Le champs "${fieldName}" est requis`);
                continue;
            }
            if (json[fieldName] == undefined) {
                //console.log('Champs ' + fieldName + ' indéfini. Ignoré.')
                continue;
            }
            if (typeof json[fieldName] !== 'string') {
                console.log('Champs ' + fieldName + ' n\'est pas une chaine, ignoré.');
                continue;
            }
            let value = json[fieldName];
            if (value.length == 0) {
                errors.push(`Le champs "${fieldName}" ne peut pas être une chaine vide`);
                continue;
            }
            // Empty options
            // In case of json[fieldName] == array or other, the options should always be an empty. So you just check the existence of the property.
            // If you wanna check a property that's an object, use another validation model and call Checker.check again, separately.
            // For an array, just do it yourself, dummy.
            if (Object.keys(options).length == 0) {
                console.log('Pas d\'option pour ' + fieldName);
                continue;
            }
            // ♪ ♫ ♪
            for (const option in options) {
                let func = this.validateFunctions[option];
                if (!func)
                    continue;
                let err = func(value, fieldName, options[option]);
                err && errors.push(err);
            }
            // ♪ ♫ ♪
        }
        for (const field in input) {
            !validMod[field] && errors.push(`Le champs ${field} n'est pas sensé exister`);
        }
        return errors;
    }
    sanitize(payload) {
        for (let item in payload) {
            if (this.notToEscape[item] || typeof payload[item] != "string") {
                continue;
            }
            payload[item] = validator_1.default.escape(payload[item]);
        }
    }
}
exports.default = Checker;
