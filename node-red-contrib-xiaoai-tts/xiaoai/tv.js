const querystring = require('querystring')
const request = require('./request')
const { appendParam, randomString } = require('./utils')
const { API } = require('./const')

function mibt (operation, { cookie, deviceId }) {
  const param = {
    deviceId: deviceId,
    message: JSON.stringify(operation),
    method: 'wakeup_tv',
    path: 'mibt',
    requestId: randomString(30)
  }
  const url = appendParam(API.USBS, querystring.stringify(param))

  return request({
    url,
    method: 'POST',
    headers: {
      Cookie: cookie
    }
  })
}

function wakeupStop ({ cookie, deviceId }) {
  return mibt({ 'action': 'stop' }, { cookie, deviceId })
}

function wakeupTV (mac, { cookie, deviceId }) {
  return mibt({ mac: mac }, { cookie, deviceId })
}

module.exports = { wakeupTV, wakeupStop }
