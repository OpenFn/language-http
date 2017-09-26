export function setUrl(configuration, path) {
  if ( !configuration ) return path
  else if ( configuration.baseUrl ) return configuration.baseUrl + path
  else return path
}

export function setAuth(configuration, manualAuth) {
  if ( manualAuth ) return manualAuth
  else if ( configuration.username ) return {
    'username': configuration.username,
    'password': configuration.password,
    'sendImmediately': ( configuration.authType != 'digest' )
  }
  else return null
}

export function assembleError({ response, error }) {
  if (response) {
    if ([200,201,202].indexOf(response.statusCode) > -1) return false;
  }
  if (error) return error;
  return new Error(`Server responded with ${response.statusCode}`)
}

export function tryJson(data) {
  try {
    return JSON.parse(data)
  } catch(e) {
    return data
  }
}
