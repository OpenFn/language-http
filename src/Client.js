import request from 'request'

export function req( method, { url, headers, body, auth, query } ) {
  return new Promise((resolve, reject) => {
    request.post ({
      url,
      headers,
      auth,
      qs: query,
      json: body
    }, function(error, response, body){
      if(error) {
        reject(error);
      } else {
        console.log("POST succeeded.");
        resolve(body);
      }
    })
  })
}
