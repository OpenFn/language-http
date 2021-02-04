/** @module Adaptor */
import {
  setAuth,
  setUrl,
  mapToAxiosConfig,
  tryJson,
  assembleError,
} from './Utils';
import {
  execute as commonExecute,
  expandReferences,
  composeNextState,
  http,
} from '@openfn/language-common';
import nodeRequest from 'request';
import cheerio from 'cheerio';
import cheerioTableparser from 'cheerio-tableparser';
import fs from 'fs';
import parse from 'csv-parse';
import tough from 'tough-cookie';

const { axios } = http;
exports.axios = axios;

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
    data: null,
  };

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state });
  };
}

var cookiejar = new tough.CookieJar();
var Cookie = tough.Cookie;

axios.interceptors.request.use(config => {
  cookiejar?.getCookies(config.url, (err, cookies) => {
    config.headers.cookie = cookies?.join('; ');
  });
  return config;
});

function handleCookies(response) {
  if (response.config?.keepCookie) {
    let cookies;
    let keepCookies = [];

    if (response.headers['set-cookie']) {
      if (response.headers['set-cookie'] instanceof Array) {
        cookies = response.headers['set-cookie']?.map(Cookie.parse);
      } else {
        cookies = [Cookie.parse(response.headers['set-cookie'])];
      }

      response.headers['set-cookie']?.forEach(c => {
        cookiejar.setCookie(
          Cookie.parse(c),
          response.config.url,
          (err, cookie) => {
            keepCookies?.push(cookie?.cookieString());
          }
        );
      });
    }

    return {
      ...response,
      data: {
        ...response.data,
        __cookie: keepCookies?.length === 1 ? keepCookies[0] : keepCookies,
        __headers: response.headers,
      },
    };
  }

  return response;
}

function handleResponse(state, response) {
  const error = assembleError({
    error: response.error,
    response,
    params: response.config,
  });

  if (error) throw error;

  const compatibleResp = {
    ...response,
    httpStatus: response.status,
    message: response.statusText,
    data: tryJson(response.data),
  };

  const respWithCookies = handleCookies(compatibleResp);

  return {
    ...composeNextState(state, respWithCookies.data),
    response: respWithCookies,
  };
}

function handleCallback(state, callback) {
  if (callback) return callback(state);
  return state;
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
    path = expandReferences(path)(state);
    params = http.expandRequestReferences(params)(state);

    const url = setUrl(state.configuration, path);

    const auth = setAuth(
      state.configuration,
      params?.authentication ?? params?.auth
    );

    const config = mapToAxiosConfig({ ...params, url, auth });

    return http
      .get(config)(state)
      .then(response => handleResponse(state, response))
      .then(nextState => handleCallback(nextState, callback));
  };
}

/**
 * Make a POST request
 * @public
 * @example
 *  post("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "application/json"},
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
 * @returns {operation}
 */
export function post(path, params, callback) {
  return state => {
    path = expandReferences(path)(state);
    params = http.expandRequestReferences(params)(state);

    const url = setUrl(state.configuration, path);

    const auth = setAuth(
      state.configuration,
      params?.authentication ?? params?.auth
    );

    const config = mapToAxiosConfig({ ...params, url, auth });

    return http
      .post(config)(state)
      .then(response => handleResponse(state, response))
      .then(nextState => handleCallback(nextState, callback));
  };
}

/**
 * Make a PUT request
 * @public
 * @example
 *  put("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "application/json"},
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
    path = expandReferences(path)(state);
    params = http.expandRequestReferences(params)(state);

    const url = setUrl(state.configuration, path);

    const auth = setAuth(
      state.configuration,
      params?.authentication ?? params?.auth
    );

    const config = mapToAxiosConfig({ ...params, url, auth });

    return http
      .put(config)(state)
      .then(response => handleResponse(state, response))
      .then(nextState => handleCallback(nextState, callback));
  };
}

/**
 * Make a PATCH request
 * @public
 * @example
 *  patch("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "application/json"},
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
    path = expandReferences(path)(state);
    params = http.expandRequestReferences(params)(state);

    const url = setUrl(state.configuration, path);

    const auth = setAuth(
      state.configuration,
      params?.authentication ?? params?.auth
    );

    const config = mapToAxiosConfig({ ...params, url, auth });

    return http
      .patch(config)(state)
      .then(response => handleResponse(state, response))
      .then(nextState => handleCallback(nextState, callback));
  };
}

/**
 * Make a DELETE request
 * @public
 * @example
 *  del("/myendpoint", {
 *      body: {"foo": "bar"},
 *      headers: {"content-type": "application/json"},
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
    path = expandReferences(path)(state);
    params = http.expandRequestReferences(params)(state);

    const url = setUrl(state.configuration, path);

    const auth = setAuth(
      state.configuration,
      params?.authentication ?? params?.auth
    );

    const config = mapToAxiosConfig({ ...params, url, auth });

    return http
      .delete(config)(state)
      .then(response => handleResponse(state, response))
      .then(nextState => handleCallback(nextState, callback));
  };
}

/**
 * Cheerio parser for XML and HTML
 * @public
 * @example
 *  parseXML(body, function($){
 *    return $("table[class=your_table]").parsetable(true, true, true);
 *  })
 * @function
 * @param {String} body - data string to be parsed
 * @param {function} script - script for extracting data
 * @returns {Operation}
 */
export function parseXML(body, script) {
  return state => {
    const $ = cheerio.load(body);
    cheerioTableparser($);

    if (script) {
      const result = script($);
      try {
        const r = JSON.parse(result);
        return composeNextState(state, r);
      } catch (e) {
        return composeNextState(state, { body: result });
      }
    } else {
      return composeNextState(state, { body: body });
    }
  };
}

/**
 * CSV-Parse for CSV conversion to JSON
 * @public
 * @example
 *  parseCSV("/home/user/someData.csv", {
 * 	  quoteChar: '"',
 * 	  header: false,
 * 	});
 * @function
 * @param {String} target - string or local file with CSV data
 * @param {Object} config - csv-parse config object
 * @returns {Operation}
 */
export function parseCSV(target, config) {
  return state => {
    return new Promise((resolve, reject) => {
      var csvData = [];

      try {
        fs.readFileSync(target);
        fs.createReadStream(target)
          .pipe(parse(config))
          .on('data', csvrow => {
            console.log(csvrow);
            csvData.push(csvrow);
          })
          .on('end', () => {
            console.log(csvData);
            resolve(composeNextState(state, csvData));
          });
      } catch (err) {
        var csvString;
        if (typeof target === 'string') {
          csvString = target;
        } else {
          csvString = expandReferences(target)(state);
        }
        csvData = parse(csvString, config, (err, output) => {
          console.log(output);
          resolve(composeNextState(state, output));
        });
      }
    });
  };
}

/**
 * Make a request using the 'request' node module. This module is deprecated.
 * @example
 *  request(params);
 * @function
 * @param {object} params - Query, Headers and Authentication parameters
 * @returns {Operation}
 */
export function request(params) {
  return state => {
    params = http.expandRequestReferences(params)(state);

    return new Promise((resolve, reject) => {
      nodeRequest(params, (error, response, body) => {
        error = assembleError({ error, response, params });
        error && reject(error);

        console.log(
          '✓ Request succeeded. (The response body available in state.)'
        );
        const resp = tryJson(body);
        resolve(resp);
      });
    });
  };
}

export {
  alterState,
  dataPath,
  dataValue,
  each,
  field,
  fields,
  http,
  lastReferenceValue,
  merge,
  sourceValue,
} from '@openfn/language-common';
