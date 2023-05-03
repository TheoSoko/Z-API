import { ValidationModel } from '../types/types'


export default class ValidationModels{

    static CreateUser: ValidationModel = {
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

    static UpdateUser: ValidationModel = {
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

    static CreateFavorite: ValidationModel = {
        title: {
            required: true,
            maxLength: 300,
        },
        link: {
            required: true,
            maxLength: 355,
        },
        image: {
            required: true,
            maxLength: 355,
        },
        country: {
            required: true,
            maxLength: 50,
        },
        publication_date: {
            required: true,
            date: true
        },
        description: {
            maxLength: 355,
        }
    }

    static CreateReview: ValidationModel = {
        theme: {
            required: true,
            maxLength: 255,
        },
        numero: {
            
        },
        presentation: {
            maxLength: 255,
        },
        image: {
            maxLength: 100,
        },
    }

    static updateReview: ValidationModel = {
        theme: {
            maxLength: 255,
        },
        numero: {
            
        },
        presentation: {
            maxLength: 255,
        },
        image: {
            maxLength: 100,
        },
    }

    static ReviewArticle: ValidationModel = {
        title: {
            required: true,
            maxLength: 100
        },
        link: {
            required: true,
            maxLength: 500
        },
        image: {
            maxLength: 500
        },
        country: {
            maxLength: 50
        },
        publication_date: {
            required: true,
            date: true
        },
        description: {
            maxLength: 300
        }
    }

    static search: ValidationModel = {
        q : {
            required: true
        },
        country : {
            required: true,
            maxLength: 3
        },
        thematic : {
            required: true
        },
        image : {

        },
        sort : {

        }

    }


}
