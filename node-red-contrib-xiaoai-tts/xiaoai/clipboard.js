
const request = require('./request')
const { randomString } = require('./utils')
const { API } = require('./const')

async function clipboard (cookie, msg) {
  const rep = await request({
    url: 'https://i.mi.com/clipboard/lite/text',
    type: 'json',
    method: 'post',
    data: {
      text: msg,
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

module.exports = clipboard
