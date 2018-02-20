import request from 'request'
import { assembleError, tryJson } from './Utils';

export function req( method, params ) {
  const { url, headers, body, auth, query, rest } = params;
  return new Promise((resolve, reject) => {
    const j = request.jar();
    request ({
      url,
      headers,
      auth,
      qs: query,
      method: method,
      json: body,
      jar: j,
      ...rest
    }, function(error, response, body){
      error = assembleError({error, response})
      if(error) {
        reject(error);
      } else {
        console.log(`✓ ${method} succeeded.`);
        const resp = tryJson(body);
        if(rest.keepCookie) {
          const cookie = j.getCookieString(url);
          resolve({
            cookie,
            ...resp
          });
        } else {
          resolve(
            resp
          );
        }
      }
    })
  })
}
