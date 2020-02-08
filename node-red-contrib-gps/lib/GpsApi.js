const axios = require('axios')
const CryptoJS = require('crypto-js')
const GpsApiCode = require('./GpsApiCode')

// 提前10s更新
const EXPIRE_TIME = (10 * 1000)

const baseUrl = { 'gpsoo': 'http://api.gpsoo.net/1',
  'gmiot': 'http://litapi.gmiot.net/1' }

class GpsApi {
  constructor (node, config) {
    this.node = node
    this.config = config
  }
  getToken () {
    const { set: setCache, get: getCache } = this.node.context().global
    const { phone, password, platform } = this.config
    const cache_key = `gps-${phone}-${platform}`
    return new Promise(async (resolve, reject) => {
      try {
        const cache = getCache(cache_key)
        if (cache && cache.time && ((cache.time - new Date().valueOf()) < EXPIRE_TIME)) {
          resolve(cache.token)
          return
        }
        const time = parseInt(new Date().getTime() / 1000, 10)
        const md5Pass = CryptoJS.MD5(password).toString()
        const signature = CryptoJS.MD5(md5Pass + time).toString()
        const { data } = await axios.get(`${baseUrl[platform]}/auth/access_token?account=${phone}&time=${time}&signature=${signature}`, {
          headers: {
            'Content-type': 'Content-type: text/html; charset=utf-8'
          }
        }).catch(err => {
          throw new Error(`[GPS api Token]${err}`)
        })
        if (data.ret != 0) {
          const msg = GpsApiCode[data.ret] || data.msg
          throw new Error(`[GPS api Token]${msg}`)
        }
        if (!data.access_token) {
          reject(new Error('[GPS api Token]token获取失败'))
        }
        setCache(cache_key, {
          token: data.access_token,
          time: data.expires_in * 1000 + new Date().getTime()
        })
        resolve(data.access_token)
      } catch (err) { reject(err) }
    })
  }

  monitor () {
    return new Promise(async (resolve, reject) => {
      try {
        const { phone, platform } = this.config
        const access_token = await this.getToken()

        const { data } = await axios.get(`${baseUrl[platform]}/account/monitor?target=${phone}&access_token=${access_token}`, {
          headers: {
            'Content-type': 'Content-type: text/html; charset=utf-8'
          }
        }).catch(err => {
          throw new Error(`【监控】monitor ${err}`)
        })

        if (data.ret != 0) {
          const msg = GpsApiCode[data.ret] || data.msg
          throw new Error(`【监控】monitor${msg}`)
        }
        resolve(data.data)
      } catch (error) {
        reject(error)
      }
    })
  }

  address (longitude, latitude) {
    return new Promise(async (resolve, reject) => {
      try {
        const { platform } = this.config
        const access_token = await this.getToken()

        console.log(`${baseUrl[platform]}/tool/address?lng=${longitude}&lat=${latitude}&access_token=${access_token}`)

        const { data } = await axios.get(`${baseUrl[platform]}/tool/address?lng=${longitude}&lat=${latitude}&access_token=${access_token}`, {
          headers: {
            'Content-type': 'Content-type: text/html; charset=utf-8'
          }
        }).catch(err => {
          throw new Error(`[【逆地理位置解析】]${err}`)
        })

        if (data.ret != 0) {
          const msg = GpsApiCode[data.ret] || data.msg
          throw new Error(`[【逆地理位置解析】]${msg}`)
        }
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
}
module.exports = GpsApi
