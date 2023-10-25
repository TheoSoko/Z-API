"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ValidationModels = {
    CreateUser: {
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
    },
    UpdateUser: {
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
        country: {},
    },
    CreateFavorite: {
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
    },
    CreateReview: {
        theme: {
            required: true,
            maxLength: 255,
        },
        numero: {},
        presentation: {
            maxLength: 255,
        },
        image: {
            maxLength: 1000,
        },
        visibility_id: {
            required: true,
            isInt: true,
        },
    },
    updateReview: {
        theme: {
            maxLength: 255,
        },
        numero: {},
        presentation: {
            maxLength: 255,
        },
        image: {
            maxLength: 100,
        },
    },
    ReviewArticle: {
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
    },
    search: {
        q: {
            required: true
        },
        country: {
            required: true,
            maxLength: 3
        },
        thematic: {
            required: true
        },
        image: {},
        sort: {}
    }
};
exports.default = ValidationModels;
