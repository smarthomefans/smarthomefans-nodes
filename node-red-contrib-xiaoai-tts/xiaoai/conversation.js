const querystring = require('querystring')
const request = require('./request')
const { appendParam, randomString } = require('./utils')
const { API } = require('./const')

function conversation (limit, { cookie, deviceId }) {
  const param = {
    timestamp: Date.now(),
    limit,
    requestId: 'app_ios_' + randomString(30)
  }
  const url = appendParam(`${API.USER_PROFILE}/device_profile/conversation`, querystring.stringify(param))

  return request({
    url,
    method: 'GET',
    headers: {
      Cookie: `${cookie};deviceId=${deviceId}`
    }
  })
}

module.exports = { conversation }
