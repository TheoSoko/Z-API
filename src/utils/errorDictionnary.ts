import boom from '@hapi/boom'


const errorDictionnary: {[key: string] : boom.Boom<unknown>} = {
    'ER_NO_DEFAULT_FOR_FIELD': boom.badData('Un des paramètres n\'a pas été fourni'),
    existingUser: boom.conflict('Un utilisateur avec cette adresse email existe déjà'),
    unidentified: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    noPayload: boom.badRequest('Le corps de la requête est vide, il devrait contenir les informations nécessaires à celle-ci')
}

export default errorDictionnary