'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /** @module Adaptor */


exports.execute = execute;
exports.get = get;
exports.post = post;
exports.put = put;
exports.patch = patch;
exports.del = del;

var _languageCommon = require('language-common');

Object.keys(_languageCommon).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _languageCommon[key];
    }
  });
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _Utils = require('./Utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
    data: []
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
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

  return function (state) {
    var _state$configuration = state.configuration,
        baseUrl = _state$configuration.baseUrl,
        username = _state$configuration.username,
        password = _state$configuration.password,
        authType = _state$configuration.authType;

    var url = baseUrl ? baseUrl + path : path;

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        query = _expandReferences.query,
        headers = _expandReferences.headers,
        authentication = _expandReferences.authentication;

    var auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {
      _request2.default.get({
        url: url,
        qs: query,
        auth: auth,
        headers: headers
      }, function (error, response, body) {
        error = (0, _Utils.assembleError)({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ GET request succeeded.");
          resolve(body);
        }
      });
    }).then(function (response) {
      var nextState = _extends({}, state, {
        data: [].concat(_toConsumableArray(state.data), [(0, _Utils.tryJson)(response.body)])
      });
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
function post(path, params, callback) {

  return function (state) {
    var _state$configuration2 = state.configuration,
        baseUrl = _state$configuration2.baseUrl,
        username = _state$configuration2.username,
        password = _state$configuration2.password,
        authType = _state$configuration2.authType;

    var url = baseUrl ? baseUrl + path : path;

    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state),
        query = _expandReferences2.query,
        headers = _expandReferences2.headers,
        authentication = _expandReferences2.authentication,
        body = _expandReferences2.body;

    var auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        qs: query,
        json: body,
        auth: auth,
        headers: headers
      }, function (error, response, body) {
        error = (0, _Utils.assembleError)({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ POST request succeeded.");
          resolve(body);
        }
      });
    }).then(function (response) {
      // TODO: Decide if response goes to head or tail of the data array...
      var nextState = _extends({}, state, { data: [].concat(_toConsumableArray(state.data), [response]) });
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
function put(path, params, callback) {

  return function (state) {
    var _state$configuration3 = state.configuration,
        baseUrl = _state$configuration3.baseUrl,
        username = _state$configuration3.username,
        password = _state$configuration3.password,
        authType = _state$configuration3.authType;

    var url = baseUrl ? baseUrl + path : path;

    var _expandReferences3 = (0, _languageCommon.expandReferences)(params)(state),
        query = _expandReferences3.query,
        headers = _expandReferences3.headers,
        authentication = _expandReferences3.authentication,
        body = _expandReferences3.body;

    var auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {
      _request2.default.put({
        url: url,
        qs: query,
        json: body,
        auth: auth,
        headers: headers
      }, function (error, response, body) {
        error = (0, _Utils.assembleError)({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ PUT request succeeded.");
          resolve(body);
        }
      });
    }).then(function (response) {
      // TODO: Decide if response goes to head or tail of the data array...
      var nextState = _extends({}, state, { data: [].concat(_toConsumableArray(state.data), [response]) });
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
function patch(path, params, callback) {

  return function (state) {
    var _state$configuration4 = state.configuration,
        baseUrl = _state$configuration4.baseUrl,
        username = _state$configuration4.username,
        password = _state$configuration4.password,
        authType = _state$configuration4.authType;

    var url = baseUrl ? baseUrl + path : path;

    var _expandReferences4 = (0, _languageCommon.expandReferences)(params)(state),
        query = _expandReferences4.query,
        headers = _expandReferences4.headers,
        authentication = _expandReferences4.authentication,
        body = _expandReferences4.body;

    var auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {
      _request2.default.patch({
        url: url,
        qs: query,
        json: body,
        auth: auth,
        headers: headers
      }, function (error, response, body) {
        error = (0, _Utils.assembleError)({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ PATCH request succeeded.");
          resolve(body);
        }
      });
    }).then(function (response) {
      // TODO: Decide if response goes to head or tail of the data array...
      var nextState = _extends({}, state, { data: [].concat(_toConsumableArray(state.data), [response]) });
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
function del(path, params, callback) {

  return function (state) {
    var _state$configuration5 = state.configuration,
        baseUrl = _state$configuration5.baseUrl,
        username = _state$configuration5.username,
        password = _state$configuration5.password,
        authType = _state$configuration5.authType;

    var url = baseUrl ? baseUrl + path : path;

    var _expandReferences5 = (0, _languageCommon.expandReferences)(params)(state),
        query = _expandReferences5.query,
        headers = _expandReferences5.headers,
        authentication = _expandReferences5.authentication,
        body = _expandReferences5.body;

    var auth = authentication || {
      'username': username,
      'password': password,
      'sendImmediately': authType != 'digest'
    };

    return new Promise(function (resolve, reject) {
      _request2.default.delete({
        url: url,
        qs: query,
        json: body,
        auth: auth,
        headers: headers
      }, function (error, response, body) {
        error = (0, _Utils.assembleError)({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("\x1b[32m%s\x1b[0m", "✓ DELETE request succeeded.");
          resolve(body);
        }
      });
    }).then(function (response) {
      // TODO: Decide if response goes to head or tail of the data array...
      var nextState = _extends({}, state, { data: [].concat(_toConsumableArray(state.data), [response]) });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
}
