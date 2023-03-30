import boom from '@hapi/boom'

type ErrorDictionary = {[key: string] : boom.Boom<unknown>}

const Errors: ErrorDictionary = {
    'ER_NO_DEFAULT_FOR_FIELD': boom.badData('Un des paramètres n\'a pas été fourni'),
    existing_user: boom.conflict('Un utilisateur avec cette adresse email existe déjà'),
    unidentified: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    server: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    no_payload: boom.badRequest('Le corps de la requête est vide, il devrait contenir les informations nécessaires à celle-ci'),
    no_id: boom.badRequest('Veuillez fournir un id dans l\'url de la requête'),
    no_id_friends: boom.badRequest('Veuillez fournir les id des deux utilisateurs concernés dans l\'url de la requête'),
    already_friends: boom.conflict('Les utilisateurs sont déjà amis'),
    already_sent_invitation: boom.conflict('Une demande d`\'ami a déjà été envoyée de la part de l\'utilisateur actuel'),
}

export default Errors