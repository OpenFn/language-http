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
exports.request = request;
exports.parseCSV = parseCSV;
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

var _Client = require("./Client");

var _Utils = require("./Utils");

var _languageCommon = require("language-common");

var _cheerio = _interopRequireDefault(require("cheerio"));

var _cheerioTableparser = _interopRequireDefault(require("cheerio-tableparser"));

var _fs = _interopRequireDefault(require("fs"));

var _csvParse = _interopRequireDefault(require("csv-parse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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


function get(path, params, callback) {
  return state => {
    var _params$authenticatio, _params, _params2;

    path = (0, _languageCommon.expandReferences)(path)(state);
    params = (0, _languageCommon.expandReferences)(params)(state);
    console.log('params', params);
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const auth = (0, _Utils.setAuth)(state.configuration, (_params$authenticatio = (_params = params) === null || _params === void 0 ? void 0 : _params.authentication) !== null && _params$authenticatio !== void 0 ? _params$authenticatio : (_params2 = params) === null || _params2 === void 0 ? void 0 : _params2.auth);
    const config = (0, _Utils.mapToAxiosConfig)({ ...params,
      url,
      auth
    }); // const {
    //   query,
    //   headers,
    //   authentication,
    //   body,
    //   formData,
    //   options,
    //   ...rest
    // } = expandReferences(params)(state);
    // return req('GET', { url, query, auth, headers, options, ...rest }).then(

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
 * @returns {Operation}
 */


function post(path, params, callback) {
  return state => {
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const {
      query,
      headers,
      authentication,
      body,
      formData,
      options,
      ...rest
    } = (0, _languageCommon.expandReferences)(params)(state);
    const auth = (0, _Utils.setAuth)(state.configuration, authentication);
    return (0, _Client.req)('POST', {
      url,
      query,
      body,
      auth,
      headers,
      formData,
      options,
      ...rest
    }).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response);
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
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const {
      query,
      headers,
      authentication,
      body,
      formData,
      options,
      ...rest
    } = (0, _languageCommon.expandReferences)(params)(state);
    const auth = (0, _Utils.setAuth)(state.configuration, authentication);
    return (0, _Client.req)('PUT', {
      url,
      query,
      body,
      formData,
      auth,
      headers,
      options,
      ...rest
    }).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response);
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
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const {
      query,
      headers,
      authentication,
      body,
      formData,
      options,
      ...rest
    } = (0, _languageCommon.expandReferences)(params)(state);
    const auth = (0, _Utils.setAuth)(state.configuration, authentication);
    return (0, _Client.req)('PATCH', {
      url,
      query,
      body,
      formData,
      options,
      auth,
      headers,
      ...rest
    }).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response);
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
    const url = (0, _Utils.setUrl)(state.configuration, path);
    const {
      query,
      headers,
      authentication,
      body,
      formData,
      options,
      ...rest
    } = (0, _languageCommon.expandReferences)(params)(state);
    const auth = (0, _Utils.setAuth)(state.configuration, authentication);
    return (0, _Client.req)('DELETE', {
      url,
      query,
      body,
      formData,
      options,
      auth,
      headers,
      ...rest
    }).then(response => {
      const nextState = (0, _languageCommon.composeNextState)(state, response);
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
 * Make a request using the 'request' node module.
 * @public
 * @example
 *  request(params);
 * @function
 * @param {object} params - Query, Headers and Authentication parameters
 * @returns {Operation}
 */


function request(params) {
  return state => {
    const expanded = typeof params === 'string' ? params : (0, _languageCommon.expandReferences)(params)(state);
    return (0, _Client.rawRequest)(expanded);
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
