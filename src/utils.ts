export function isObject(value: any) {
  return Object.prototype.toString.call(value).split(' ')[1] === 'Object]'
}

export function pick(obj: { [key: string]: any }, keys: string | string[]) {
  if (!isObject(obj) && typeof obj !== 'function') {
    return {}
  }

  var res = {}
  if (typeof keys === 'string') {
    if (keys in obj) {
      res[keys] = obj[keys]
    }
    return res
  }

  var len = keys.length
  var idx = -1

  while (++idx < len) {
    var key = keys[idx]
    if (key in obj) {
      res[key] = obj[key]
    }
  }
  return res
}
