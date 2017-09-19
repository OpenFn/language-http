/** @module Adaptor */
import request from 'request';
import { tryJson } from './Utils';
import { req } from './Client';
import { execute as commonExecute, tryJson, nextState, expandReferences } from 'language-common';

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

     const { baseUrl, username, password, authType } = state.configuration;
     const url = ( baseUrl ? baseUrl + path : path );

     const { query, headers, authentication } = expandReferences(params)(state);

     const auth = authentication || {
       'username': username,
       'password': password,
       'sendImmediately': (authType != 'digest')
     }

     req("GET", {url, query, auth, headers})
     .then((response) => {
       const nextState = nextState(state, tryJson(response))
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

     const auth = authentication || {
       'username': username,
       'password': password,
       'sendImmediately': (authType != 'digest')
     }

     req("POST", {url, query, body, auth, headers})
     .then((response) => {
       const nextState = nextState(state, tryJson(response))
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

    const auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    req("PUT", {url, query, body, auth, headers})
    .then((response) => {
      const nextState = nextState(state, tryJson(response))
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

    const auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    req("PATCH", {url, query, body, auth, headers})
    .then((response) => {
      const nextState = nextState(state, tryJson(response))
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

    const auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': (authType != 'digest')
    }

    req("DELETE", {url, query, body, auth, headers})
    .then((response) => {
      const nextState = nextState(state, tryJson(response))
      if (callback) return callback(nextState);
      return nextState;
    })
  }
}

export * from 'language-common';
