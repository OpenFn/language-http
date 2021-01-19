"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUrl = setUrl;
exports.setAuth = setAuth;
exports.assembleError = assembleError;
exports.tryJson = tryJson;
exports.mapToAxiosConfig = mapToAxiosConfig;

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
  var _requestConfig$url, _requestConfig$params, _requestConfig$data, _requestConfig$auth, _requestConfig$respon, _requestConfig$respon2, _requestConfig$httpAg;

  return { ...requestConfig,
    url: (_requestConfig$url = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.url) !== null && _requestConfig$url !== void 0 ? _requestConfig$url : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.uri,
    // method,
    // baseURL,
    // transformRequest,
    // transformResponse,
    // headers,
    params: (_requestConfig$params = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.params) !== null && _requestConfig$params !== void 0 ? _requestConfig$params : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.qs,
    // paramsSerializer,
    data: (_requestConfig$data = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.data) !== null && _requestConfig$data !== void 0 ? _requestConfig$data : (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.body) || (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.form) || (requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.formData),
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
    // validateStatus,
    // maxRedirects,
    // socketPath,
    httpAgent: (_requestConfig$httpAg = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.httpAgent) !== null && _requestConfig$httpAg !== void 0 ? _requestConfig$httpAg : requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.agent // httpsAgent,
    // proxy,
    // cancelToken,
    // decompress,

  };
}
