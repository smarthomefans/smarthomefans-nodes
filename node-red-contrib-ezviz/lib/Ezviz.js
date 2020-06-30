const axios = require('axios')
const moment = require('moment')
// Load method categories.
const array = require('lodash/array')
const EzvizCode = require('./EzvizCode')

// 有效期7天，提前8小时更新
const EXPIRE_TIME =  (1000 * 3600 * 8 )
// 打开方式
const openType = { 0: '指纹', 1: '密码', 2: '卡' }

class EzvizClass {
  constructor (node, config) {
    this.node = node
    this.config = config
  }
  getToken () {
    const { set: setCache, get: getCache } = this.node.context().global
    const { client_id, client_secret } = this.config
    const cache_key = `ys7-${client_id}`
    return new Promise(async (resolve, reject) => {
      try {
        const cache = getCache(cache_key)
        if (cache && cache.time && ((cache.time - new Date().valueOf() ) < EXPIRE_TIME)) {
          // console.log('has cache', cache)
          resolve(cache.token)
          return
        }
        const { data } = await axios.post(`https://open.ys7.com/api/lapp/token/get?appKey=${client_id}&appSecret=${client_secret}`, {
          params: { grant_type: 'client_credentials' },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石Token]${err}`)
        })
        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石Token]${msg}`)
        }
        if (!data.data.accessToken) {
          reject(new Error('[萤石Token]token获取失败'))
        }
        setCache(cache_key, {
          token: data.data.accessToken,
          time: data.data.expireTime
        })
        resolve(data.data.accessToken)
      } catch (err) { reject(err) }
    })
  }

  openList (config) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.getToken()

        const { data } = await axios.post(`https://open.ys7.com/api/lapp/keylock/open/list?accessToken=${token}&deviceSerial=${config.payload}&pageStart=0&pageSize=20`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石keylock]${err}`)
        })

        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石keylock]${msg}`)
        }
        let res = data.data
        if (res) {
          res = res.map(function (item) {
            item.type = openType[item.openType]
            item.date = moment(item.openTime).format('YYYY-MM-DD HH:mm:ss')
            return item
          })
        } else {
          throw new Error(`[萤石keylock]无数据`)
        }
        const { set: setCache, get: getCache } = this.node.context().global
        const { client_id } = this.config
        const cache_key = `ys7-openData-${client_id}`
        const cache = getCache(cache_key) || []
        // 对比和上次差异的数据
        const diff = array.differenceBy(res, cache, 'openTime')

        setCache(cache_key, res)

        resolve({ last: res[0], diff })
      } catch (error) {
        reject(error)
      }
    })
  }

  captureImage (config) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.getToken()

        const { data } = await axios.post(`https://open.ys7.com/api/lapp/device/capture?accessToken=${token}&deviceSerial=${config.payload}&channelNo=${config.channelNo}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石capture]${err}`)
        })

        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石capture]${msg}`)
        }
        resolve(data.data)
      } catch (error) {
        reject(error)
      }
    })
  }
  //云台控制（调用预置点）
  presetMove (config) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.getToken()

        const { data } = await axios.post(`https://open.ys7.com/api/lapp/device/preset/move?accessToken=${token}&deviceSerial=${config.payload}&channelNo=${config.channelNo}&index=${config.index}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石capture]${err}`)
        })

        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石capture]${msg}`)
        }
        resolve(data.data)
      } catch (error) {
        reject(error)
      }
    })
  }

  //获取摄像头列表
  cameraList (config) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.getToken()
        var url = `https://open.ys7.com/api/lapp/camera/list?accessToken=${token}`
        if(config.pageStart != null){
            url += "&pageStart="+config.pageStart
        }
        if(config.pageSize != null){
            url += "&pageSize="+config.pageSize
        }
        const { data } = await axios.post(url, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石capture]${err}`)
        })

        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石capture]${msg}`)
        }
        resolve(data.data)
      } catch (error) {
        reject(error)
      }
    })
  }

  //获取镜头遮蔽开关状态
  sceneSwitchStatus (config) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.getToken()

        const { data } = await axios.post(`https://open.ys7.com/api/lapp/device/scene/switch/status?accessToken=${token}&deviceSerial=${config.payload}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石capture]${err}`)
        })

        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石capture]${msg}`)
        }
        resolve(data.data)
      } catch (error) {
        reject(error)
      }
    })
  }

  //设置镜头遮蔽开关
  sceneSwitchSet (config) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = await this.getToken()
        var url = `https://open.ys7.com/api/lapp/device/scene/switch/set?accessToken=${token}&deviceSerial=${config.payload}&enable=${config.enable}`
        if(config.channelNo != null ){
          url = url += "&channelNo="+config.channelNo
        }
        const { data } = await axios.post(url, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).catch(err => {
          throw new Error(`[萤石capture]${err}`)
        })

        if (data.code != 200) {
          const msg = EzvizCode[data.code] || data.msg
          throw new Error(`[萤石capture]${msg}`)
        }
        resolve(data.data)
      } catch (error) {
        reject(error)
      }
    })
  }

}
module.exports = EzvizClass
