/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-05-10 23:33:45
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-05-11 01:13:55
 */
/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-05-10 23:33:45
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-05-10 23:33:45
 */
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