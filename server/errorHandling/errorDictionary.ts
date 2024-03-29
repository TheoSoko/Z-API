import boom from '@hapi/boom'

type ErrorDictionary = {[key: string] : boom.Boom<unknown>}

const Errors: ErrorDictionary = {
    'ER_NO_DEFAULT_FOR_FIELD': boom.badData('Un des paramètres n\'a pas été fourni'),
    existing_user: boom.conflict('Un utilisateur avec cette adresse email existe déjà'),
    unidentified: boom.badImplementation('Veuillez nous excuser, une erreur inconnue est survenue'),
    server: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
    no_payload: boom.badRequest('Le corps de la requête est vide, il devrait contenir les informations nécessaires à celle-ci'),
    no_id: boom.badRequest('Veuillez fournir un id dans l\'url de la requête'),
    no_ressource_id: boom.badRequest('Veuillez utiliser l\'id de la ressource pour construire l\'url de la requête'),
    no_user_id: boom.badRequest('Veuillez utiliser l\'id de l\'utilisateur pour construire l\'url de la requête'),
    no_id_friends: boom.badRequest('Veuillez fournir les id des deux utilisateurs concernés dans l\'url de la requête'),
    already_friends: boom.conflict('Les utilisateurs sont déjà amis'),
    already_sent_invitation: boom.conflict('Une demande d`\'ami a déjà été envoyée de la part de l\'utilisateur actuel'),
    not_found: boom.notFound('Désolé, la ressource n\'a pas été trouvée'),
    not_found_2: boom.notFound('La ressource indiquée n\'a pas été trouvée'),
    delete_no_query: boom.badRequest('Veuillez indiquez le(s) id(s) des articles à enlever de la revue en paramètre de "query" comme ceci: ?id=1,2,3'),
    //For development only
    db_unavailable: boom.serverUnavailable('Impossible de se connecter à la base de données'),
}

export default Errors