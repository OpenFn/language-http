/** @module Adaptor */

import { execute as commonExecute, expandReferences } from 'language-common';
import { getThenPost, clientPost } from './Client';
import request from 'request';
import { resolve as resolveUrl } from 'url';

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
    data: []
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}


/**
 * Make a GET request
 * @public
 * @example
 *  get("/myendpoint", {
 *      query: {foo: "bar", a: 1},
 *      headers: {"content-type": "application/json"},
 *      authentication: {username: "user", password: "pass"}
 *    },
 *    function(state) {
 *      return state;
 *    }
 *  )
 * @function
 * @param {string} path - Path to resource
 * @param {object} params - Query, Headers and Authentication parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
 export function get(path, params, callback) {

   function assembleError({ response, error }) {
     if ([200,201,202].indexOf(response.statusCode) > -1) return false;
     if (error) return error;
     return new Error(`Server responded with ${response.statusCode}`)
   }

   return state => {

     const { baseUrl, username, password, authType } = state.configuration;
     const url = ( baseUrl ? baseUrl + path : path );

     const { query, headers, authentication } = expandReferences(params)(state);

     const auth = authentication || {
       'username': username,
       'password': password,
       'sendImmediately': (authType != 'digest')
     }

     return new Promise((resolve, reject) => {
       request.get({
         url,
         qs: query,
         auth,
         headers
       }, function(error, response, body){
         error = assembleError({error, response})
         if (error) {
           reject(error);
         } else {
           console.log("\x1b[32m%s\x1b[0m", "✓ GET request succeeded.");
           resolve(body)
         }
       });
     })
     .then((response) => {
       // TODO: Decide if response goes to head or tail of the data array...
       const nextState = { ...state, data: [ ...state.data, response ] }
       if (callback) return callback(nextState);
       return nextState;
     })

   }
 }


/**
 * Make a POST request
 * @public
 * @example
 *  post("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "json"},
 *      authentication: {username: "user", password: "pass"},
 *    },
 *    function(state) {
 *      return state;
 *    }
 *  )
 * @function
 * @param {string} path - Path to resource
 * @param {object} params - Body, Query, Headers and Authentication parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
 export function post(path, params, callback) {

   function assembleError({ response, error }) {
     if ([200,201,202].indexOf(response.statusCode) > -1) return false;
     if (error) return error;
     return new Error(`Server responded with ${response.statusCode}`)
   }

   return state => {

     const { baseUrl, username, password, authType } = state.configuration;
     const url = ( baseUrl ? baseUrl + path : path );

     const { query, headers, authentication, body } = expandReferences(params)(state);

     const auth = authentication || {
       'username': username,
       'password': password,
       'sendImmediately': (authType != 'digest')
     }

     return new Promise((resolve, reject) => {
       request.post({
         url,
         qs: query,
         json: body,
         auth,
         headers
       }, function(error, response, body){
         error = assembleError({error, response})
         if (error) {
           reject(error);
         } else {
           console.log("\x1b[32m%s\x1b[0m", "✓ POST request succeeded.");
           resolve(body)
         }
       });
     })
     .then((response) => {
       // TODO: Decide if response goes to head or tail of the data array...
       const nextState = { ...state, data: [ ...state.data, response ] }
       if (callback) return callback(nextState);
       return nextState;
     })

   }
 }


/**
 * Make a PUT request
 * @public
 * @example
 *  put("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "json"},
 *      authentication: {username: "user", password: "pass"},
 *    },
 *    function(state) {
 *      return state;
 *    }
 *  )
 * @function
 * @param {string} path - Path to resource
 * @param {object} params - Body, Query, Headers and Auth parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function put(path, params, callback) {

  function assembleError({ response, error }) {
    if ([200,201,202,204].indexOf(response.statusCode) > -1) return false;
    if (error) return error;
    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const { baseUrl, username, password, authType } = state.configuration;
    const url = ( baseUrl ? baseUrl + path : path );

    const { query, headers, authentication, body } = expandReferences(params)(state);

    const auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    return new Promise((resolve, reject) => {
      request.put({
        url,
        qs: query,
        json: body,
        auth,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ PUT request succeeded.");
          resolve(body)
        }
      });
    })
    .then((response) => {
      // TODO: Decide if response goes to head or tail of the data array...
      const nextState = { ...state, data: [ ...state.data, response ] }
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}


/**
 * Make a PATCH request
 * @public
 * @example
 *  patch("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "json"},
 *      authentication: {username: "user", password: "pass"},
 *    },
 *    function(state) {
 *      return state;
 *    }
 *  )
 * @function
 * @param {string} path - Path to resource
 * @param {object} params - Body, Query, Headers and Auth parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function patch(path, params, callback) {

  function assembleError({ response, error }) {
    if ([200,201,202,204].indexOf(response.statusCode) > -1) return false;
    if (error) return error;
    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const { baseUrl, username, password, authType } = state.configuration;
    const url = ( baseUrl ? baseUrl + path : path );

    const { query, headers, authentication, body } = expandReferences(params)(state);

    const auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    return new Promise((resolve, reject) => {
      request.patch({
        url,
        qs: query,
        json: body,
        auth,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ PATCH request succeeded.");
          resolve(body)
        }
      });
    })
    .then((response) => {
      // TODO: Decide if response goes to head or tail of the data array...
      const nextState = { ...state, data: [ ...state.data, response ] }
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

/**
 * Make a DELETE request
 * @public
 * @example
 *  del("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "json"},
 *      authentication: {username: "user", password: "pass"},
 *    },
 *    function(state) {
 *      return state;
 *    }
 *  )
 * @function
 * @param {string} path - Path to resource
 * @param {object} params - Body, Query, Headers and Auth parameters
 * @param {function} callback - (Optional) Callback function
 * @returns {Operation}
 */
export function del(path, params, callback) {

  function assembleError({ response, error }) {
    if ([200,201,202,204].indexOf(response.statusCode) > -1) return false;
    if (error) return error;
    return new Error(`Server responded with ${response.statusCode}`)
  }

  return state => {

    const { baseUrl, username, password, authType } = state.configuration;
    const url = ( baseUrl ? baseUrl + path : path );

    const { query, headers, authentication, body } = expandReferences(params)(state);

    const auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    return new Promise((resolve, reject) => {
      request.delete({
        url,
        qs: query,
        json: body,
        auth,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ DELETE request succeeded.");
          resolve(body)
        }
      });
    })
    .then((response) => {
      // TODO: Decide if response goes to head or tail of the data array...
      const nextState = { ...state, data: [ ...state.data, response ] }
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

export * from 'language-common';
