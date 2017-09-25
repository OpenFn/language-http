'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAuth = setAuth;
exports.assembleError = assembleError;
exports.tryJson = tryJson;
function setAuth(configuration, manualAuth) {
  if (manualAuth) return manualAuth;else if (configuration.username) return {
    'username': configuration.username,
    'password': configuration.password,
    'sendImmediately': configuration.authType != 'digest'
  };else return null;
}

function assembleError(_ref) {
  var response = _ref.response,
      error = _ref.error;

  if (response) {
    if ([200, 201, 202].indexOf(response.statusCode) > -1) return false;
  }
  if (error) return error;
  return new Error('Server responded with ' + response.statusCode);
}

function tryJson(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}
