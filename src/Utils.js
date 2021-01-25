import FormData from 'form-data';
import { isEmpty } from 'lodash/fp';

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
  let form = null;

  const formData = requestConfig?.formData || requestConfig?.form;

  let headers = requestConfig?.headers;

  if (requestConfig?.gzip === true) {
    headers = { ...headers, 'Accept-Encoding': 'gzip, deflate' };
  }
  if (!isEmpty(formData)) {
    form = new FormData();
    Object.entries(formData).forEach(element => {
      form.append(element[0], element[1]);
    });

    const formHeaders = form.getHeaders();

    headers = { ...headers, ...formHeaders };
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
    data: requestConfig?.data ?? (requestConfig?.body || form),
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
    validateStatus: function (status) {
      return (
        (status >= 200 && status < 300) ||
        requestConfig?.options?.successCodes?.includes(status)
      );
    },
    maxRedirects:
      requestConfig?.maxRedirects ??
      (requestConfig?.followAllRedirects === false ? 0 : 5),
    // socketPath,
    // httpAgent: requestConfig?.httpAgent ?? requestConfig?.agent,
    // httpsAgent,
    // proxy,
    // cancelToken,
    // decompress,
  };
}