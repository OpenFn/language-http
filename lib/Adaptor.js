"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execute = execute;
exports.get = get;
exports.post = post;
exports.put = put;
exports.patch = patch;
exports.del = del;
exports.parseXML = parseXML;
exports.parseCSV = parseCSV;
exports.request = request;
exports.newAgent = newAgent;
Object.defineProperty(exports, "alterState", {
  enumerable: true,
  get: function () {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, "dataPath", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, "dataValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, "each", {
  enumerable: true,
  get: function () {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, "field", {
  enumerable: true,
  get: function () {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, "fields", {
  enumerable: true,
  get: function () {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, "http", {
  enumerable: true,
  get: function () {
    return _languageCommon.http;
  }
});
Object.defineProperty(exports, "lastReferenceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.lastReferenceValue;
  }
});
Object.defineProperty(exports, "merge", {
  enumerable: true,
  get: function () {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, "sourceValue", {
  enumerable: true,
  get: function () {
    return _languageCommon.sourceValue;
  }
});

var _Utils = require("./Utils");

var _languageCommon = require("@openfn/language-common");

var _request = _interopRequireDefault(require("request"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _cheerioTableparser = _interopRequireDefault(require("cheerio-tableparser"));

var _fs = _interopRequireDefault(require("fs"));

var _csvParse = _interopRequireDefault(require("csv-parse"));

var _toughCookie = _interopRequireDefault(require("tough-cookie"));

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** @module Adaptor */
const {
  axios
} = _languageCommon.http;
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

function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  };
  return state => {
    return (0, _languageCommon.execute)(...operations)({ ...initialState,
      ...state
    });
  };
} // axios interceptors


var Cookie = _toughCookie.default.Cookie;
var cookiejar = new _toughCookie.default.CookieJar();
axios.interceptors.request.use(function (config) {
  cookiejar === null || cookiejar === void 0 ? void 0 : cookiejar.getCookies(config.url, function (err, cookies) {
    config.headers.cookie = cookies === null || cookies === void 0 ? void 0 : cookies.join('; ');
  });
  return config;
});
axios.interceptors.response.use(function (response) {
  let cookies;
  let keepCookies = [];
  response = { ...response,
    httpStatus: response.status,
    message: response.statusText
  };

  if (response.headers['set-cookie']) {
    var _response$headers$set, _response$headers$set2;

    if (response.headers['set-cookie'] instanceof Array) cookies = (_response$headers$set = response.headers['set-cookie']) === null || _response$headers$set === void 0 ? void 0 : _response$headers$set.map(Cookie.parse);else cookies = [Cookie.parse(response.headers['set-cookie'])];
    (_response$headers$set2 = response.headers['set-cookie']) === null || _response$headers$set2 === void 0 ? void 0 : _response$headers$set2.forEach(function (c) {
      cookiejar.setCookie(Cookie.parse(c), response.config.url, function (err, cookie) {
        var _response$config;

        if ((_response$config = response.config) === null || _response$config === void 0 ? void 0 : _response$config.keepCookie) {
          keepCookies === null || keepCookies === void 0 ? void 0 : keepCookies.push(cookie === null || cookie === void 0 ? void 0 : cookie.cookieString());
        }
      });
    });
  }

  const resData = (0, _Utils.tryJson)(response.data);
  return { ...response,
    data: { ...resData,
      __cookie: (keepCookies === null || keepCookies === void 0 ? void 0 : keepCookies.length) === 1 ? keepCookies[0] : keepCookies,
      __headers: response.headers
    }
  };
});
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

function get(path, params, callback) {
  return state => {
    var _params$authenticatio, _params, _params2;

    path = (0, _languageCommon.expandReferences)(path)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const auth = (0, _Utils.setAuth)(state.configuration, (_params$authenticatio = (_params = params) === null || _params === void 0 ? void 0 : _params.authentication) !== null && _params$authenticatio !== void 0 ? _params$authenticatio : (_params2 = params) === null || _params2 === void 0 ? void 0 : _params2.auth);
    const config = (0, _Utils.mapToAxiosConfig)({ ...params,
      url,
      auth
    });
    return _languageCommon.http.get(config)(state).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    });
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


function post(path, params, callback) {
  return state => {
    var _params$authenticatio2;

    path = (0, _languageCommon.expandReferences)(path)(state);
    const {
      https
    } = params; // delete params.https;
    // params = { ...expandReferences(params)(state), https };

    const url = (0, _Utils.setUrl)(state.configuration, path);
    const auth = (0, _Utils.setAuth)(state.configuration, (_params$authenticatio2 = params === null || params === void 0 ? void 0 : params.authentication) !== null && _params$authenticatio2 !== void 0 ? _params$authenticatio2 : params === null || params === void 0 ? void 0 : params.auth);
    const config = (0, _Utils.mapToAxiosConfig)({ ...params,
      url,
      auth
    });
    return _languageCommon.http.post(config)(state).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    });
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


function put(path, params, callback) {
  return state => {
    var _params$authenticatio3, _params3, _params4;

    path = (0, _languageCommon.expandReferences)(path)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const auth = (0, _Utils.setAuth)(state.configuration, (_params$authenticatio3 = (_params3 = params) === null || _params3 === void 0 ? void 0 : _params3.authentication) !== null && _params$authenticatio3 !== void 0 ? _params$authenticatio3 : (_params4 = params) === null || _params4 === void 0 ? void 0 : _params4.auth);
    const config = (0, _Utils.mapToAxiosConfig)({ ...params,
      url,
      auth
    });
    return _languageCommon.http.put(config)(state).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    });
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


function patch(path, params, callback) {
  return state => {
    var _params$authenticatio4, _params5, _params6;

    path = (0, _languageCommon.expandReferences)(path)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const auth = (0, _Utils.setAuth)(state.configuration, (_params$authenticatio4 = (_params5 = params) === null || _params5 === void 0 ? void 0 : _params5.authentication) !== null && _params$authenticatio4 !== void 0 ? _params$authenticatio4 : (_params6 = params) === null || _params6 === void 0 ? void 0 : _params6.auth);
    const config = (0, _Utils.mapToAxiosConfig)({ ...params,
      url,
      auth
    });
    return _languageCommon.http.patch(config)(state).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    });
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


function del(path, params, callback) {
  return state => {
    var _params$authenticatio5, _params7, _params8;

    path = (0, _languageCommon.expandReferences)(path)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const auth = (0, _Utils.setAuth)(state.configuration, (_params$authenticatio5 = (_params7 = params) === null || _params7 === void 0 ? void 0 : _params7.authentication) !== null && _params$authenticatio5 !== void 0 ? _params$authenticatio5 : (_params8 = params) === null || _params8 === void 0 ? void 0 : _params8.auth);
    const config = (0, _Utils.mapToAxiosConfig)({ ...params,
      url,
      auth
    });
    return _languageCommon.http.delete(config)(state).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response.data);
      if (callback) return callback(nextState);
      return nextState;
    });
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


function parseXML(body, script) {
  return state => {
    const $ = _cheerio.default.load(body);

    (0, _cheerioTableparser.default)($);

    if (script) {
      const result = script($);

      try {
        const r = JSON.parse(result);
        return (0, _languageCommon.composeNextState)(state, r);
      } catch (e) {
        return (0, _languageCommon.composeNextState)(state, {
          body: result
        });
      }
    } else {
      return (0, _languageCommon.composeNextState)(state, {
        body: body
      });
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


function parseCSV(target, config) {
  return state => {
    return new Promise((resolve, reject) => {
      var csvData = [];

      try {
        _fs.default.readFileSync(target);

        _fs.default.createReadStream(target).pipe((0, _csvParse.default)(config)).on('data', csvrow => {
          console.log(csvrow);
          csvData.push(csvrow);
        }).on('end', () => {
          console.log(csvData);
          resolve((0, _languageCommon.composeNextState)(state, csvData));
        });
      } catch (err) {
        var csvString;

        if (typeof target === 'string') {
          csvString = target;
        } else {
          csvString = (0, _languageCommon.expandReferences)(target)(state);
        }

        csvData = (0, _csvParse.default)(csvString, config, (err, output) => {
          console.log(output);
          resolve((0, _languageCommon.composeNextState)(state, output));
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


function request(params) {
  return state => {
    params = (0, _languageCommon.expandReferences)(params)(state);
    return new Promise((resolve, reject) => {
      (0, _request.default)(params, (error, response, body) => {
        error = (0, _Utils.assembleError)({
          error,
          response,
          params
        });
        error && reject(error);
        console.log('✓ Request succeeded. (The response body available in state.)');
        const resp = (0, _Utils.tryJson)(body);
        resolve(resp);
      });
    });
  };
} // set the CA from the expression?


function newAgent(options) {
  return new _https.default.Agent(options);
}
