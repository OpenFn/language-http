import request from 'request'
import { assembleError, tryJson } from './Utils';

export function req( method, { url, headers, body, auth, query } ) {
  return new Promise((resolve, reject) => {
    request ({
      url,
      headers,
      auth,
      qs: query,
      method: method,
      json: body
    }, function(error, response, body){
      error = assembleError({error, response})
      if(error) {
        reject(error);
      } else {
        console.log(`✓ ${method} succeeded.`);
        resolve(
          tryJson(body)
        );
      }
    })
  })
}
