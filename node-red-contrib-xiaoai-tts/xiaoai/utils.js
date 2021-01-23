const { createHash, randomBytes } = require('crypto')

function getHashFn (algorithm, encoding = 'hex') {
  return data => {
    const hash = createHash(algorithm)

    if (isObject(data)) {
      data = JSON.stringify(data)
    }

    return hash.update(data).digest(encoding)
  }
}

function isObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function appendParam (url = '', param) {
  if (!url) return ''
  if (!param) return url

  url = url.replace(/[?&]$/, '')
  return /\?/.test(url) ? `${url}&${param}` : `${url}?${param}`
}

function serializeData (data) {
  return Object.keys(data)
    .map(key => `${key}=${data[key]}`)
    .join('&')
}

function parseResponseText (text) {
  return parseBigIntJson(
    text
      .replace(/^&&&START&&&/, '')
  )
}

function parseBigIntJson(str) {
  // If there is no big integer, Use native JSON.parse
  if (/\d{16,}/.test(str)) {
    const replaceMap = []
    let n = 0

    // extract Strings in JSON
    str = str
      .replace(/"(\\?[\s\S])*?"/g, match => {
        // remove Strings containing big integer
        if (/\d{16,}/.test(match)) {
          replaceMap.push(match)
          // Three double quotation marks never appear in vaild JSON
          return '"""'
        }

        return match
      })
      .replace(/[+\-\d.eE]{16,}/g, match => {
        if (/^\d{16,}$/.test(match)) {
          // match big integers in numbers
          return '"' + match + '"'
        }

        return match
      })
      .replace(/"""/g, function() {
        // replace Strings back
        return replaceMap[n++]
      })
  }

  return JSON.parse(str)
}

function randomString (length) {
  if (!Number.isFinite(length)) {
    throw new TypeError('Expected a finite number')
  }

  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

module.exports = {
  md5: getHashFn('md5'),
  sha1Base64: getHashFn('sha1', 'base64'),
  isObject,
  getHashFn,
  appendParam,
  randomString,
  serializeData,
  parseResponseText
}
