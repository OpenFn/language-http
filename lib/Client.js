'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.req = req;

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _Utils = require('./Utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function req(method, _ref) {
  var url = _ref.url,
      headers = _ref.headers,
      body = _ref.body,
      auth = _ref.auth,
      query = _ref.query;

  return new Promise(function (resolve, reject) {
    (0, _request2.default)({
      url: url,
      headers: headers,
      auth: auth,
      qs: query,
      method: method,
      json: body
    }, function (error, response, body) {
      error = (0, _Utils.assembleError)({ error: error, response: response });
      if (error) {
        reject(error);
      } else {
        console.log('\u2713 ' + method + ' succeeded.');
        resolve((0, _Utils.tryJson)(body));
      }
    });
  });
}
