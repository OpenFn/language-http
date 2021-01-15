"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rawRequest = rawRequest;
exports.req = req;

var _request = _interopRequireDefault(require("request"));

var _Utils = require("./Utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rawRequest(params) {
  return new Promise((resolve, reject) => {
    (0, _request.default)(params, (error, response, body) => {
      error = (0, _Utils.assembleError)({
        error,
        response,
        params
      });
      error && reject(error);
      console.log(`✓ Request succeeded. (The response body will be available in state.)`);
      const resp = (0, _Utils.tryJson)(body);
      resolve(resp);
    });
  });
}

function req(method, params) {
  const {
    body,
    query,
    ...rest
  } = params;
  return new Promise((resolve, reject) => {
    const j = _request.default.jar();

    (0, _request.default)({
      jar: j,
      json: body,
      method: method,
      qs: query,
      ...rest
    }, function (error, response, body) {
      error = (0, _Utils.assembleError)({
        error,
        response,
        params
      });

      if (error) {
        reject(error);
      } else {
        console.log(`✓ ${method} succeeded. (The response body will be available in state.)`);
        const resp = (0, _Utils.tryJson)(body);

        if (rest.keepCookie) {
          const __cookie = j.getCookieString(params.url);

          resolve({
            __cookie,
            __headers: response.headers,
            ...resp
          });
        } else {
          resolve(resp);
        }
      }
    });
  });
}
