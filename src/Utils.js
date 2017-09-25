export function assembleError({ response, error }) {
  if ([200,201,202].indexOf(response.statusCode) > -1) return false;
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
