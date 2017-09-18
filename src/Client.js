import request from 'request'
import { assembleError } from './Utils';

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
        console.log("\x1b[32m%s\x1b[0m", `✓ ${method} succeeded.`);
        resolve(body);
      }
    })
  })
}
