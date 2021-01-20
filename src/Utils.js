import { head } from 'language-common/lib/http';

export function setUrl(configuration, path) {
  if (configuration && configuration.baseUrl)
    return configuration.baseUrl + path;
  else return path;
}

export function setAuth(configuration, manualAuth) {
  if (manualAuth) return manualAuth;
  else if (configuration && configuration.username)
    return {
      username: configuration.username,
      password: configuration.password,
      sendImmediately: configuration.authType != 'digest',
    };
  else return null;
}

export function assembleError({ response, error, params }) {
  if (response) {
    const customCodes = params.options && params.options.successCodes;
    if ((customCodes || [200, 201, 202]).indexOf(response.statusCode) > -1)
      return false;
  }
  if (error) return error;
  return new Error(
    `Server responded with:  \n${JSON.stringify(response, null, 2)}`
  );
}

export function tryJson(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return { body: data };
  }
}

export function mapToAxiosConfig(requestConfig) {
  console.log('rawRequestconfig', requestConfig);
  let headers = requestConfig?.headers;
  if (requestConfig?.gzip === true) {
    headers = { ...headers, 'Accept-Encoding': 'gzip, deflate' };
  }
  return {
    ...requestConfig,
    url: requestConfig?.url ?? requestConfig?.uri,
    // method,
    // baseURL,
    // transformRequest,
    // transformResponse,
    headers,
    params: {
      ...requestConfig?.params,
      ...requestConfig?.qs,
      ...requestConfig?.query,
    },
    // paramsSerializer,
    data:
      requestConfig?.data ??
      (requestConfig?.body || requestConfig?.form || requestConfig?.formData),
    // timeouts,
    // withCredentials,
    // adapter,
    auth: requestConfig?.auth ?? requestConfig?.authentication,
    responseType: requestConfig?.responseType ?? requestConfig?.json,
    responseEncoding:
      requestConfig?.responseEncoding ?? requestConfig?.encoding,
    // xsrfCookieName,
    // xsrfHeaderName,
    // onUploadProgress,
    // onDownloadProgress,
    // maxContentLength,
    // maxBodyLength,
    // validateStatus,
    maxRedirects:
      requestConfig?.maxRedirects ??
      (requestConfig?.followAllRedirects === false ? 0 : 5),
    // socketPath,
    httpAgent: requestConfig?.httpAgent ?? requestConfig?.agent,
    // httpsAgent,
    // proxy,
    // cancelToken,
    // decompress,
  };
}
