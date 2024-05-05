const fetch = require('node-fetch')
const querystring = require('querystring')
const { appendParam, parseResponseText } = require('./utils')
const { SDK_VER, APP_VER ,APP_UA, MINA_UA} = require('./const')

class HttpError extends Error {
  constructor (rep) {
    super()

    this.rep = rep
    this.status = rep.status
    this.message = [
      'Request Error',
      `url: ${rep.url}`,
      `status: ${rep.status}`,
      `statusText: ${rep.statusText}`
    ].join('\n')
    this.message += '\n'
  }
}

function request ({
  url = '',
  method = 'GET',
  data,
  type = 'json',
  headers = {}
}) {
  method = typeof method === 'string' ? method.toUpperCase() : 'GET'
  const contentType =
    method == 'POST' ? 'application/x-www-form-urlencoded' : 'application/json'

  if (!headers['Content-Type'] ) {
    headers['Content-Type'] =  contentType
  }

  const options = {
    method: method,
    headers: Object.assign(
      {
        Connection: 'keep-alive',
        'User-Agent': url.includes('mina.mi.com') ? MINA_UA : APP_UA,
        Accept: '*/*'
      },
      headers
    )
  }

  if (method === 'GET') {
    const urlParam = data ? querystring.stringify(data) : ''

    url = appendParam(url, urlParam)
  } else if (method === 'POST') {
    const contentType = options.headers['Content-Type'] || ''
    let body

    if (contentType.indexOf('application/json') > -1) {
      body = typeof data === 'string' ? data : JSON.stringify(data)
    } else {
      body = querystring.stringify(data || {})
      options.headers['Content-Length'] = body.length
    }

    if (body) {
      options.body = body
    }
  }

  return fetch(url, options).then(rep => {
    if (rep.status == 200) {
      switch (type) {
        case 'raw':
          return rep
        case 'json':
          return rep.json()
        case 'xiaoai':
          return rep.text().then(parseResponseText)
        default:
          return rep.text()
      }
    }

    throw new HttpError(rep)
  })
}

module.exports = request
