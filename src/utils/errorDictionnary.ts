import boom from '@hapi/boom'


const errorDictionnary: {[key: string] : boom.Boom<unknown>} = {
    'ER_NO_DEFAULT_FOR_FIELD': boom.badData('Un des paramètres n\'a pas été fourni'),
    existingUser: boom.conflict('Un utilisateur avec cette adresse email existe déjà'),
    unidentified: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    server: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    noPayload: boom.badRequest('Le corps de la requête est vide, il devrait contenir les informations nécessaires à celle-ci'),
    noId: boom.badRequest('Veuillez fournir un id dans l\'url de la requête'),
    noIdFriends: boom.badRequest('Veuillez fournir les id des deux utilisateurs concernés dans l\'url de la requête'),
    alreadyFriends: boom.conflict('Les utilisateurs sont déjà amis'),
    alreadySent: boom.conflict('Une demande d`\'ami a déjà été envoyée de la part de l\'utilisateur actuel'),
}

export default errorDictionnary