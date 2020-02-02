const querystring = require('querystring')
const request = require('./request')
const { appendParam, randomString } = require('./utils')
const { API } = require('./const')

function mediaplayer (operation, method = 'player_play_operation', { cookie, deviceId }) {
  const param = {
    deviceId: deviceId,
    message: JSON.stringify({ 'action': operation }),
    method: method,
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

function play ({ cookie, deviceId }) {
  return mediaplayer('play', 'player_play_operation', { cookie, deviceId })
}

function pause ({ cookie, deviceId }) {
  return mediaplayer('pause', 'player_play_operation', { cookie, deviceId })
}

function play_status ({ cookie, deviceId }) {
  return mediaplayer('', 'player_get_play_status', { cookie, deviceId })
}

// player_wakeup
function prev ({ cookie, deviceId }) {
  return mediaplayer('prev', 'player_play_operation', { cookie, deviceId })
}

function next ({ cookie, deviceId }) {
  return mediaplayer('next', 'player_play_operation', { cookie, deviceId })
}

function toggle ({ cookie, deviceId }) {
  return mediaplayer('toggle', 'player_play_operation', { cookie, deviceId })
}

module.exports = { play, pause, play_status, prev, next, toggle }
