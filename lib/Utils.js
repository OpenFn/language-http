"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUrl = setUrl;
exports.setAuth = setAuth;
exports.assembleError = assembleError;
exports.tryJson = tryJson;
exports.mapToAxiosConfig = mapToAxiosConfig;

var _formData = _interopRequireDefault(require("form-data"));

var _fp = require("lodash/fp");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setUrl(configuration, path) {
  if (configuration && configuration.baseUrl) return configuration.baseUrl + path;else return path;
}

function setAuth(configuration, manualAuth) {
  if (manualAuth) return manualAuth;else if (configuration && configuration.username) return {
    username: configuration.username,
    password: configuration.password,
    sendImmediately: configuration.authType != 'digest'
  };else return null;
}

function assembleError({
  response,
  error,
  params
}) {
  if (response) {
    const customCodes = params.options && params.options.successCodes;
    if ((customCodes || [200, 201, 202]).indexOf(response.statusCode) > -1) return false;
  }

  if (error) return error;
  return new Error(`Server responded with:  \n${JSON.stringify(response, null, 2)}`);
}

function tryJson(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {
      body: data
    };
  }
}

function mapToAxiosConfig(requestConfig) {
  var _requestConfig$url, _requestConfig$data, _requestConfig$auth, _requestConfig$respon, _requestConfig$respon2, _requestConfig$maxRed;

  let form = null;
  const formData = (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.formData) || (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.form);
  let headers = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.headers;

  if ((requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.gzip) === true) {
    headers = { ...headers,
      'Accept-Encoding': 'gzip, deflate'
    };
  }

  if (!(0, _fp.isEmpty)(formData)) {
    form = new _formData.default();
    Object.entries(formData).forEach(element => {
      form.append(element[0], element[1]);
    });
    const formHeaders = form.getHeaders();
    headers = { ...headers,
      ...formHeaders
    };
  }

  return { ...requestConfig,
    url: (_requestConfig$url = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.url) !== null && _requestConfig$url !== void 0 ? _requestConfig$url : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.uri,
    // method,
    // baseURL,
    // transformRequest,
    // transformResponse,
    headers,
    params: { ...(requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.params),
      ...(requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.qs),
      ...(requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.query)
    },
    // paramsSerializer,
    data: (_requestConfig$data = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.data) !== null && _requestConfig$data !== void 0 ? _requestConfig$data : (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.body) || form,
    // timeouts,
    // withCredentials,
    // adapter,
    auth: (_requestConfig$auth = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.auth) !== null && _requestConfig$auth !== void 0 ? _requestConfig$auth : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.authentication,
    responseType: (_requestConfig$respon = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.responseType) !== null && _requestConfig$respon !== void 0 ? _requestConfig$respon : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.json,
    responseEncoding: (_requestConfig$respon2 = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.responseEncoding) !== null && _requestConfig$respon2 !== void 0 ? _requestConfig$respon2 : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.encoding,
    // xsrfCookieName,
    // xsrfHeaderName,
    // onUploadProgress,
    // onDownloadProgress,
    // maxContentLength,
    // maxBodyLength,
    validateStatus: function (status) {
      var _requestConfig$option, _requestConfig$option2;

      return status >= 200 && status < 300 || (requestConfig === null || requestConfig === void 0 ? void 0 : (_requestConfig$option = requestConfig.options) === null || _requestConfig$option === void 0 ? void 0 : (_requestConfig$option2 = _requestConfig$option.successCodes) === null || _requestConfig$option2 === void 0 ? void 0 : _requestConfig$option2.includes(status));
    },
    maxRedirects: (_requestConfig$maxRed = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.maxRedirects) !== null && _requestConfig$maxRed !== void 0 ? _requestConfig$maxRed : (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.followAllRedirects) === false ? 0 : 5 // socketPath,
    // httpAgent: requestConfig?.httpAgent ?? requestConfig?.agent,
    // httpsAgent,
    // proxy,
    // cancelToken,
    // decompress,

  };
}
