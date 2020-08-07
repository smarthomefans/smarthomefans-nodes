const request = require('./request')
const { randomString } = require('./utils')
const { API } = require('./const')

async function getLiveDevice (cookie) {
  const rep = await request({
    url: API.DEVICE_MI+'/full/status',
    type: 'json',
    data: {
      ts: randomString(30)
    },
    headers: {
      Cookie: cookie
    }
  })

  if (rep.code == 0) {
    return rep.data.devices
  } else {
    return []
  }
}

module.exports = getLiveDevice
