import queryString from 'query-string'
/**
  通过name获取params的值
* */
const get = name => {
  let querys = {}
  const search = window.location.search.replace('?', '')
  if (search) {
    search.split('&').map(v => {
      const [key, value] = v.split('=')
      querys[key] = value
      return v
    })
    return name ? querys[name] : querys
  }
  return name ? '' : {}
}

export default {
  get,
  ...queryString,
  register(name, fun) {
    this[name] = fun
  },
}
