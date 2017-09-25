/** @module Adaptor */
import { req } from './Client';
import { setAuth } from './Utils';
import {
  execute as commonExecute,
  expandReferences,
  composeNextState
} from 'language-common';

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

   return state => {

     const { baseUrl } = state.configuration;
     const url = ( baseUrl ? baseUrl + path : path );

     const { query, headers, authentication } = expandReferences(params)(state);

     const auth = setAuth(state.configuration, authentication);

     return req("GET", {url, query, auth, headers})
     .then((response) => {
       const nextState = composeNextState(state, response)
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

   return state => {

     const { baseUrl, username, password, authType } = state.configuration;
     const url = ( baseUrl ? baseUrl + path : path );

     const { query, headers, authentication, body } = expandReferences(params)(state);

     const auth = setAuth(state.configuration, authentication);

     return req("POST", {url, query, body, auth, headers})
     .then((response) => {
       const nextState = composeNextState(state, response)
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

  return state => {

    const { baseUrl, username, password, authType } = state.configuration;
    const url = ( baseUrl ? baseUrl + path : path );

    const { query, headers, authentication, body } = expandReferences(params)(state);

    const auth = setAuth(state.configuration, authentication);

    return req("PUT", {url, query, body, auth, headers})
    .then((response) => {
      const nextState = composeNextState(state, response)
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

  return state => {

    const { baseUrl, username, password, authType } = state.configuration;
    const url = ( baseUrl ? baseUrl + path : path );

    const { query, headers, authentication, body } = expandReferences(params)(state);

    const auth = setAuth(state.configuration, authentication);

    return req("PATCH", {url, query, body, auth, headers})
    .then((response) => {
      const nextState = composeNextState(state, response)
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

  return state => {

    const { baseUrl, username, password, authType } = state.configuration;
    const url = ( baseUrl ? baseUrl + path : path );

    const { query, headers, authentication, body } = expandReferences(params)(state);

    const auth = setAuth(state.configuration, authentication);

    return req("DELETE", {url, query, body, auth, headers})
    .then((response) => {
      const nextState = composeNextState(state, response)
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

export {
  alterState,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  lastReferenceValue,
  merge,
  sourceValue,
} from 'language-common';
