const querystring = require('querystring')
const request = require('./request')
const { appendParam, randomString } = require('./utils')
const { API } = require('./const')

function setVolume (v, { cookie, deviceId }) {
    const param = {
      deviceId: deviceId,
      message: JSON.stringify({volume:v}),
      method: 'player_set_volume',
      path: 'mediaplayer',
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
  
  module.exports = setVolume