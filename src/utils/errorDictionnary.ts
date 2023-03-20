import boom from '@hapi/boom'


const errorDictionnary: {[key: string] : boom.Boom<unknown>} = {
    'ER_NO_DEFAULT_FOR_FIELD': boom.badData('Un des paramètres n\'a pas été fourni'),
    unidentified: boom.serverUnavailable('Désolé, ce service est momentanément indisponible'),
}

export default errorDictionnary