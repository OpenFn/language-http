import { execute as commonExecute, expandReferences } from 'language-common';
import { getThenPost, clientPost } from './Client';
import request from 'request';
import { resolve as resolveUrl } from 'url';

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @function
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}

/**
 * Make a GET request and POST it somewhere else
 * @public
 * @example
 *   fetch(params)
 * @function
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
export function fetch(params) {

  return state => {

    const { getEndpoint, query, postUrl } = expandReferences(params)(state);

    const { username, password, baseUrl, authType } = state.configuration;

    var sendImmediately = authType == 'digest' ? false : true;

    const url = resolveUrl(baseUrl + '/', getEndpoint)

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query))

    return getThenPost({ username, password, query, url, sendImmediately, postUrl })
    .then((response) => {
      console.log("Success:", response);
      let result = (typeof response === 'object') ? response : JSON.parse(response);
      return { ...state, references: [ result, ...state.references ] }
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      if (callback) return callback(nextState);
      return nextState;
    })

  }
}

/**
 * Make a GET request and POST the response somewhere else without failing.
 * @public
 * @example
 *   fetchWithErrors(params)
 * @function
 * @param {object} params - data to make the fetch
 * @returns {Operation}
 */
export function fetchWithErrors(params) {

  return state => {

    const { getEndpoint, query, externalId, postUrl } = expandReferences(params)(state);

    const { username, password, baseUrl, authType } = state.configuration;

    var sendImmediately = authType == 'digest' ? false : true;

    const url = resolveUrl(baseUrl + '/', getEndpoint)

    console.log("Performing an error-less GET on URL: " + url);
    console.log("Applying query: " + JSON.stringify(query))

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    return new Promise((resolve, reject) => {

      request({
        url: url,      //URL to hit
        qs: query,     //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function(error, response, body){
        var taggedResponse = {
          response: response,
          externalId: externalId
        }
        console.log(taggedResponse)
        request.post ({
          url: postUrl,
          json: taggedResponse
        }, function(error, response, postResponseBody){
          error = assembleError({error, response})
          if (error) {
            console.error("POST failed.")
            reject(error);
          } else {
            console.log("POST succeeded.");
            resolve(body);
          }
        })
      });

    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })
  }
}


/**
* Make a POST request using existing data from another POST
* @public
* @example
*   postData(params)
* @function
* @param {object} params - data to make the POST
* @returns {Operation}
*/
export function postData(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { url, body, headers } = expandReferences(params)(state);

    return new Promise((resolve, reject) => {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(body, null, 4) + "\n");
      request.post ({
        url: url,
        json: body,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
          console.log(response);
        } else {
          console.log("Printing response...\n");
          console.log(JSON.stringify(response, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      return nextState;
    })

  }

}

/**
 * Make a POST request
 * @public
 * @example
 *  post("myendpoint", {
 *    body: {"foo": "bar"},
 *    headers: {"content-type": "json"},
 *    auth: {username: "user", password: "pass"},
 *    callback: function(data, state) {
 *      return state;
 *    }
 *  })
 * @function
 * @param {string} url - URL to make the POST
 * @param {object} params - body, authentication, callback and headers params
 * @returns {Operation}
 */
export function post(url, params) {

  const { body, auth, headers, callback } = params

  function assembleError({ response, error }) {
    if ([200,201,202,204].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const postUrl = url || state.configuration.baseUrl;

    const { username, password, authType } = state.configuration;
    const authen = auth ||
    { 'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    return new Promise((resolve, reject) => {
      request.post ({
        url: postUrl,
        json: body,
        auth: authen,
        headers
      }, function(error, response, body){
        if(error) {
          reject(error);
        } else {
          console.log("POST succeeded.");
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, references: [{ body: data }, ...state.references] };
      if (callback) return callback(nextState);
      return nextState;
    })

  }
}

/**
 * Make a GET request
 * @public
 * @example
 *  get("myendpoint", {
 *    query: {foo: "bar", a: 1},
 *    headers: {"content-type": "json"},
 *    auth: {username: "user", password: "pass"},
 *    callback: function(data, state) {
 *      return state;
 *    }
 *  })
 * @constructor
 * @param {string} url - Path to resource
 * @param {object} params - callback and query parameters
 * @returns {Operation}
 */
export function get(url, params) {

  const {query, headers, auth, callback} = params

  function assembleError({ response, error }) {
    if ([200,201,202].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const getUrl = url || state.configuration.baseUrl;

    const { query: qs } = expandReferences({query})(state);

    const { username, password, authType } = state.configuration;
    const authen = auth ||
    { 'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    return new Promise((resolve, reject) => {

      request.get({
        url: getUrl,
        qs: qs,
        auth: authen,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if (error) {
          reject(error);
        } else {
          resolve(body)
        }
      });

    }).then((data) => {
      const nextState = { ...state, references: [{ body: data }, ...state.references] };
      console.log("GET succeeded.");
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

//NOTE need refactor
/**
 * Make a PUT request
 * @public
 * @example
 *  put( myendpoint, {
 *      body: {...},
 *      headers: {...},
 *      callback: {...}
 *  })
 * @function
 * @param {string} url - URL to make the PUT
 * @param {object} params - body, callback and headers params
 * @returns {Operation}
 */
export function put(url, params) {
  const {body, callback, headers} = params
  return state => {

    return new Promise((resolve, reject) => {
      request.put ({
        url: url,
        json: body,
        headers
      }, function(error, response){
        if(error) {
          reject(error);
        } else {
          console.log("PUT succeeded.");
          resolve(response);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: response };
      if (callback) return callback(nextState);
      return nextState;
    })

  }
}

//NOTE need refactor
/**
 * Make a PATCH request
 * @public
 * @example
 *   patch(url, params)
 * @function
 * @param {string} url - URL to make the PATCH
 * @param {object} params - body, callback and headers params
 * @returns {Operation}
 */
export function patch(url, {body, callback, headers}) {

  return state => {

    return new Promise((resolve, reject) => {
      request.put ({
        url: url,
        json: body,
        headers
      }, function(error, response){
        if(error) {
          reject(error);
        } else {
          console.log("PATCH succeeded.");
          resolve(response);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: response };
      if (callback) return callback(nextState);
      return nextState;
    })

  }
}

//NOTE needs refactor
/**
 * Make a DELETE request
 * @public
 * @example
 *   del(path, params)
 * @function
 * @param {string} path - Path to resource
 * @param {object} params - callback and query params
 * @returns {Operation}
 */
 export function del(url, {query, callback}) {

   function assembleError({ response, error }) {
     if ([200,201,202,204].indexOf(response.statusCode) > -1) return false;
     if (error) return error;

     return new Error(`Server responded with ${response.statusCode}`)
   }

   return state => {

     const { username, password, baseUrl, authType } = state.configuration;
     const { query: qs } = expandReferences({query})(state);

     const sendImmediately = (authType != 'digest');

     const url = resolveUrl(baseUrl + '/', url)

     return new Promise((resolve, reject) => {

       request({
         url,      //URL to hit
         qs,     //Query string data
         method: 'DELETE', //Specify the method
         auth: {
           'user': username,
           'pass': password,
           'sendImmediately': sendImmediately
         }
       }, function(error, response){
         error = assembleError({error, response})
         if (error) {
           reject(error);
         } else {
           console.log("DELETE succeeded.");
           resolve(response);
         }
       });

     }).then((data) => {
       const nextState = { ...state, response: response };
       if (callback) return callback(nextState);
       return nextState;
     })
   }
 }

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
