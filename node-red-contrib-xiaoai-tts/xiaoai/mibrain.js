const querystring = require('querystring')
const request = require('./request')
const { appendParam, randomString } = require('./utils')
const { API } = require('./const')

function mibrain (operation, method, { cookie, deviceId }) {
  const param = {
    deviceId: deviceId,
    message: JSON.stringify(operation),
    method: method,
    path: 'mibrain',
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

function nlpResult ({ cookie, deviceId }) {
  return mibrain({}, 'nlp_result_get', { cookie, deviceId })
}

// {"nlp_text":"关闭餐吧台灯","nlp":1,"nlp_execute":1,"tts":0,"tts_play":0}
function aiService (msg, tts, tts_play, { cookie, deviceId }) {
  const message = { 'nlp_text': msg, 'nlp': 1, 'nlp_execute': 1, 'tts': tts, 'tts_play': tts_play }
  return mibrain(message, 'ai_service', { cookie, deviceId })
}

module.exports = { nlpResult: nlpResult, aiService: aiService }
