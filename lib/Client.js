"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.req = req;

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function req(method, _ref) {
  var url = _ref.url,
      headers = _ref.headers,
      body = _ref.body,
      auth = _ref.auth,
      query = _ref.query;

  return new Promise(function (resolve, reject) {
    _request2.default.post({
      url: url,
      headers: headers,
      auth: auth,
      qs: query,
      json: body
    }, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        console.log("POST succeeded.");
        resolve(body);
      }
    });
  });
}
