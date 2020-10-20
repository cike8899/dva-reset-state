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

export function omit(obj: { [key: string]: any }, keys: string | string[]) {
  if (!isObject(obj) && typeof obj !== 'function') {
    return {}
  }
  const allKeys = Object.keys(obj)

  if (typeof keys === 'string') {
    const nextObj = { ...obj }
    delete nextObj[keys]
    return nextObj
  }
  return allKeys.reduce((pre, cur) => {
    if (keys.every((x) => x !== cur)) {
      pre[cur] = obj[cur]
    }
    return pre
  }, {})
}

// 将数组中的对象合并为一个对象
export function merge(arr: { [key: string]: any }[]) {
  return arr.reduce((pre, cur) => {
    if (isObject(cur)) {
      pre = { ...pre, ...cur }
    }

    return pre
  }, {})
}
