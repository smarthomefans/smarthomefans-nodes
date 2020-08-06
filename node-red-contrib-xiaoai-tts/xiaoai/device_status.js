
const request = require('./request')
const { randomString } = require('./utils')
const { API } = require('./const')

async function deviceStatus (cookie,deviceId) {
  
  const rep = await request({
    url: API.DEVICE_MI+'/status?fid='+deviceId,
    type: 'json',
    data: {
      ts: randomString(30)
    },
    headers: {
      Cookie: cookie
    }
  })

  if (rep.code == 0) {
    return rep.data
  } else {
    return []
  }
}

module.exports = deviceStatus
