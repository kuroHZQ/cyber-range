/* eslint-disable no-throw-literal */
import fetch from 'dva/fetch'
import {message} from 'antd'
import {stringify} from './query'

let configs = {
  header: {
    'x-requested-with': 'XMLHttpRequest',
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: 0,
  },
  parseResponse: response => response.text(),
  checkStatus: (response, url, options) => checkStatus(response, url, options),
  afterParse: data => afterParse(data),
  handleCatch: e => handleCatch(e),
  handleBody: body => body,
}

request.init = newConfigs => {
  const newHeader = Object.assign({}, configs.header, newConfigs.header)
  configs = Object.assign(configs, newConfigs, {header: newHeader})
}

// 处理数据之后
function afterParse(data) {
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

// catch
function handleCatch(e) {
  message.error(e.message)
  throw e
}

function checkStatus(response, url, options) {
  if (
    (response.status >= 200 && response.status < 300) ||
    response.status === 304
  ) {
    return response
  }
  return response.text().then(data => {
    let messageText
    let parseData
    try {
      parseData = JSON.parse(data)
      messageText = parseData.message || parseData.error
    } catch (e) {
      parseData = {}
      messageText = data
    }
    const error = {...parseData, message: messageText, status: response.status}
    throw error
  })
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 * @param  {func} handleRes 自定义处理response，return promise
 * customCatch false 自定义处理catch
 * @param
 */
export default function request(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    customMessage = false,
    ...rest
  } = options

  let newOptions = {
    // credentials: 'same-origin',
    credentials: 'include',
    method,
    body,
    headers: Object.assign({}, configs.header, headers),
    ...rest,
  }

  newOptions.body = newOptions.handleBody
    ? newOptions.handleBody(body, newOptions)
    : configs.handleBody(body, newOptions)
  const newUrl =
    method.toLocaleLowerCase() === 'get' && /[\u4e00-\u9fa5]/.test(url)
      ? encodeURI(url)
      : url
  return fetch(newUrl, newOptions)
    .then(res =>
      newOptions.checkStatus
        ? newOptions.checkStatus(res, url, newOptions)
        : configs.checkStatus(res, url, newOptions)
    )
    .then(
      newOptions.parseResponse
        ? newOptions.parseResponse
        : configs.parseResponse
    )
    .then(data => {
      if (newOptions.afterParse) {
        return newOptions.afterParse(data)
      }
      return configs.afterParse(data)
    })
    .catch(err => {
      if (customMessage || newOptions.handleCatch) {
        newOptions.handleCatch && newOptions.handleCatch(err)
        throw err
      } else {
        configs.handleCatch(err)
      }
    })
}

request.get = (url, query) => {
  return request(`${url}${query ? `?${stringify(query)}` : ''}`)
}

request.post = (url, body, options = {}) => {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    ...options,
  })
}

request.put = (url, body, options = {}) => {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      ...options.headers,
    },
  })
}

request.delete = (url, query, options = {}) => {
  // return request(`${url}?${stringify(query)}`, {
  return request(`${url}`, {
    method: 'DELETE',
    ...options,
  })
}
