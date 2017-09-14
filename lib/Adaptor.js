'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.fetch = fetch;
exports.fetchWithErrors = fetchWithErrors;
exports.postData = postData;
exports.post = post;
exports.get = get;
exports.put = put;
exports.patch = patch;
exports.del = del;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _Client = require('./Client');

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
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
function fetch(params) {

  return function (state) {
    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        getEndpoint = _expandReferences.getEndpoint,
        query = _expandReferences.query,
        postUrl = _expandReferences.postUrl;

    var _state$configuration = state.configuration,
        username = _state$configuration.username,
        password = _state$configuration.password,
        baseUrl = _state$configuration.baseUrl,
        authType = _state$configuration.authType;


    var sendImmediately = authType == 'digest' ? false : true;

    var url = (0, _url.resolve)(baseUrl + '/', getEndpoint);

    console.log("Fetching data from URL: " + url);
    console.log("Applying query: " + JSON.stringify(query));

    return (0, _Client.getThenPost)({ username: username, password: password, query: query, url: url, sendImmediately: sendImmediately, postUrl: postUrl }).then(function (response) {
      console.log("Success:", response);
      var result = (typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' ? response : JSON.parse(response);
      return _extends({}, state, { references: [result].concat(_toConsumableArray(state.references)) });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
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
function fetchWithErrors(params) {

  return function (state) {
    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state),
        getEndpoint = _expandReferences2.getEndpoint,
        query = _expandReferences2.query,
        externalId = _expandReferences2.externalId,
        postUrl = _expandReferences2.postUrl;

    var _state$configuration2 = state.configuration,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        baseUrl = _state$configuration2.baseUrl,
        authType = _state$configuration2.authType;


    var sendImmediately = authType == 'digest' ? false : true;

    var url = (0, _url.resolve)(baseUrl + '/', getEndpoint);

    console.log("Performing an error-less GET on URL: " + url);
    console.log("Applying query: " + JSON.stringify(query));

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    return new Promise(function (resolve, reject) {

      (0, _request2.default)({
        url: url, //URL to hit
        qs: query, //Query string data
        method: 'GET', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function (error, response, body) {
        var taggedResponse = {
          response: response,
          externalId: externalId
        };
        console.log(taggedResponse);
        _request2.default.post({
          url: postUrl,
          json: taggedResponse
        }, function (error, response, postResponseBody) {
          error = assembleError({ error: error, response: response });
          if (error) {
            console.error("POST failed.");
            reject(error);
          } else {
            console.log("POST succeeded.");
            resolve(body);
          }
        });
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
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
function postData(params) {

  return function (state) {

    function assembleError(_ref2) {
      var response = _ref2.response,
          error = _ref2.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _expandReferences3 = (0, _languageCommon.expandReferences)(params)(state),
        url = _expandReferences3.url,
        body = _expandReferences3.body,
        headers = _expandReferences3.headers;

    return new Promise(function (resolve, reject) {
      console.log("Request body:");
      console.log("\n" + JSON.stringify(body, null, 4) + "\n");
      _request2.default.post({
        url: url,
        json: body,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
          console.log(response);
        } else {
          console.log("Printing response...\n");
          console.log(JSON.stringify(response, null, 4) + "\n");
          console.log("POST succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      return nextState;
    });
  };
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
function post(url, params) {
  var body = params.body,
      auth = params.auth,
      headers = params.headers,
      callback = params.callback;


  function assembleError(_ref3) {
    var response = _ref3.response,
        error = _ref3.error;

    if ([200, 201, 202, 204].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error('Server responded with ' + response.statusCode);
  }

  return function (state) {

    var postUrl = url || state.configuration.baseUrl;

    var _state$configuration3 = state.configuration,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        authType = _state$configuration3.authType;

    var authen = auth || { 'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: postUrl,
        json: body,
        auth: authen,
        headers: headers
      }, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          console.log("POST succeeded.");
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { references: [{ body: data }].concat(_toConsumableArray(state.references)) });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
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
function get(url, params) {
  var query = params.query,
      headers = params.headers,
      auth = params.auth,
      callback = params.callback;


  function assembleError(_ref4) {
    var response = _ref4.response,
        error = _ref4.error;

    if ([200, 201, 202].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error('Server responded with ' + response.statusCode);
  }

  return function (state) {

    var getUrl = url || state.configuration.baseUrl;

    var _expandReferences4 = (0, _languageCommon.expandReferences)({ query: query })(state),
        qs = _expandReferences4.query;

    var _state$configuration4 = state.configuration,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        authType = _state$configuration4.authType;

    var authen = auth || { 'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {

      _request2.default.get({
        url: getUrl,
        qs: qs,
        auth: authen,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { references: [{ body: data }].concat(_toConsumableArray(state.references)) });
      console.log("GET succeeded.");
      if (callback) return callback(nextState);
      return nextState;
    });
  };
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
function put(url, params) {
  var body = params.body,
      callback = params.callback,
      headers = params.headers;

  return function (state) {

    return new Promise(function (resolve, reject) {
      _request2.default.put({
        url: url,
        json: body,
        headers: headers
      }, function (error, response) {
        if (error) {
          reject(error);
        } else {
          console.log("PUT succeeded.");
          resolve(response);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: response });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
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
function patch(url, _ref5) {
  var body = _ref5.body,
      callback = _ref5.callback,
      headers = _ref5.headers;


  return function (state) {

    return new Promise(function (resolve, reject) {
      _request2.default.put({
        url: url,
        json: body,
        headers: headers
      }, function (error, response) {
        if (error) {
          reject(error);
        } else {
          console.log("PATCH succeeded.");
          resolve(response);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: response });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
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
function del(url, _ref6) {
  var query = _ref6.query,
      callback = _ref6.callback;


  function assembleError(_ref7) {
    var response = _ref7.response,
        error = _ref7.error;

    if ([200, 201, 202, 204].indexOf(response.statusCode) > -1) return false;
    if (error) return error;

    return new Error('Server responded with ' + response.statusCode);
  }

  return function (state) {
    var _state$configuration5 = state.configuration,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        baseUrl = _state$configuration5.baseUrl,
        authType = _state$configuration5.authType;

    var _expandReferences5 = (0, _languageCommon.expandReferences)({ query: query })(state),
        qs = _expandReferences5.query;

    var sendImmediately = authType != 'digest';

    var url = (0, _url.resolve)(baseUrl + '/', url);

    return new Promise(function (resolve, reject) {

      (0, _request2.default)({
        url: url, //URL to hit
        qs: qs, //Query string data
        method: 'DELETE', //Specify the method
        auth: {
          'user': username,
          'pass': password,
          'sendImmediately': sendImmediately
        }
      }, function (error, response) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("DELETE succeeded.");
          resolve(response);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: response });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
}
