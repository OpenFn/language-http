"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rawRequest = rawRequest;
exports.req = req;

var _request = _interopRequireDefault(require("request"));

var _Utils = require("./Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function rawRequest(params) {
  return new Promise(function (resolve, reject) {
    (0, _request["default"])(params, function (error, response, body) {
      error = (0, _Utils.assembleError)({
        error: error,
        response: response,
        params: params
      });
      error && reject(error);
      console.log("\u2713 Request succeeded. (The response body will be available in state.)");
      var resp = (0, _Utils.tryJson)(body);
      resolve(resp);
    });
  });
}

function req(method, params) {
  var body = params.body,
      query = params.query,
      rest = _objectWithoutProperties(params, ["body", "query"]);

  return new Promise(function (resolve, reject) {
    var j = _request["default"].jar();

    (0, _request["default"])(_objectSpread({
      qs: query,
      method: method,
      json: body,
      jar: j
    }, rest), function (error, response, body) {
      error = (0, _Utils.assembleError)({
        error: error,
        response: response,
        params: params
      });

      if (error) {
        reject(error);
      } else {
        console.log("\u2713 ".concat(method, " succeeded. (The response body will be available in state.)"));
        var resp = (0, _Utils.tryJson)(body);

        if (rest.keepCookie) {
          var __cookie = j.getCookieString(url);

          resolve(_objectSpread({
            __cookie: __cookie,
            __headers: response.headers
          }, resp));
        } else {
          resolve(resp);
        }
      }
    });
  });
}
