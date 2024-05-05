

const request = require('./request')
const { randomString } = require('./utils')
const { API } = require('./const')

async function deviceNoise (cookie,deviceId) {
  
  const rep = await request({
    url: API.DEVICE_MI+'/'+deviceId+'/noise',
    type: 'json',
    method: 'post',
    data: {
      auto: false,
      channel: 'web',
      imei: deviceId,
      userId: cookie.userId,
      serviceToken: cookie.serviceToken
    },
    headers: {
      Cookie: cookie.cookie
    }
  })

  if (rep.code == 0) {
    return rep
  } else {
    return []
  }
}

module.exports = deviceNoise
