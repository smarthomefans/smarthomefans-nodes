const request = require('./request')
const XiaoAiError = require('./XiaoAiError')
const { SDK_VER, API, APP_DEVICE_ID } = require('./const')
const { md5, sha1Base64, isObject } = require('./utils')

function getAiCookie (userId, serviceToken) {
  return `userId=${userId};serviceToken=${serviceToken}`
}

async function getLoginSign (id) {
  let sid = 'micoapi'
  if(id === 'i.mi.com'){
    sid = 'i.mi.com'
  }
  const info = await request({
    url: API.SERVICE_LOGIN,
    type: 'xiaoai',
    data: {
      sid: sid,
      _json: true
    }
  })

  return { _sign: info._sign, qs: info.qs }
}

async function serviceAuth (signData, user, pwd, id) {
  let url = `api.mina.mi.com`
  let sid = 'micoapi'
  if(id === 'i.mi.com'){
    sid = 'i.mi.com'
    url = 'i.mi.com'
  }
  
  const data = {
    user,
    hash: md5(pwd).toUpperCase(),
    callback: 'https://'+url+'/sts', 
    serviceParam: {checkSafePhone:false},
    sid: sid,
    _json: true,
    ...signData
  }
  const AuthInfo = await request({
    url: API.SERVICE_AUTH,
    method: 'post',
    type: 'xiaoai',
    data: data,
    headers: {
      Cookie: `deviceId=${APP_DEVICE_ID};sdkVersion=${SDK_VER}`
    }
  })

  return AuthInfo
}

async function loginMiAi (authInfo) {
  const clientSign = genClientSign(authInfo.nonce, authInfo.ssecurity)

  const rep = await request({
    url: authInfo.location,
    data: {
      clientSign
    },
    type: 'raw'
  }).catch(e => {
    if (e.rep.status == 401) {
      console.log('权限验证失败')
    }
    throw e
  })
  const cookieStr = rep.headers.get('set-cookie') || ''
  const match = cookieStr.match(/serviceToken=(.*?);/)

  return match ? match[1] : ''
}

function genClientSign (nonce, secrity) {
  const str = `nonce=${nonce}&${secrity}`
  const hashStr = sha1Base64(str)

  return hashStr
}

async function login (user, pwd, sid) {
  if (isObject(user)) {
    const { userId, serviceToken } = user
    const cookie = getAiCookie(userId, serviceToken)

    return {
      cookie: cookie,
      userId: userId,
      serviceToken
    }
  }
  const sign = await getLoginSign(sid)
  const authInfo = await serviceAuth(sign, user, pwd, sid)
  if (authInfo.code != 0) {
    throw new XiaoAiError(authInfo.code, JSON.stringify(authInfo))
  }
  const serviceToken = await loginMiAi(authInfo)
  const cookie = getAiCookie(authInfo.userId, serviceToken)

  return {
    cookie: cookie,
    userId: authInfo.userId,
    serviceToken
  }
}

login.getAiCookie = getAiCookie

module.exports = login
