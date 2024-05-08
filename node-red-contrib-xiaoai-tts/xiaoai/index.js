const login = require('./login')
const device = require('./device')
const tts = require('./tts')
const setVolume = require('./volume')
const find_device = require('./find_device')
const device_status = require('./device_status')
const device_noise = require('./device_noise')
const clipboard = require('./clipboard')
const phone_device = require('./phone_device')
const {
  play,
  pause,
  play_status,
  prev,
  next,
  toggle,
  payUrl
} = require('./mediaplayer')
const { nlpResult, aiService } = require('./mibrain')
const { wakeupTV, wakeupStop } = require('./tv')
const { conversation } = require('./conversation')
const { isObject } = require('./utils')
const request = require('./request')

class XiaoAi {
  constructor(user, pwd, sid) {
    if (isObject(user)) {
      const { userId, serviceToken } = user

      if (!userId || !serviceToken) throw new Error('参数不合法')
      this.session = login({ userId, serviceToken })
    } else {
      if (!user || !pwd) throw new Error('参数不合法')
      this.session = login(user, pwd, sid)
    }

    this.liveDevice = []
  }

  connect() {
    return this.session.then((ss) => ({
      userId: ss.userId,
      serviceToken: ss.serviceToken
    }))
  }

  async getDevice(name) {
    return this.session.then((ss) => device(ss.cookie))
  }

  async getPhoneDevice(name) {
    return this.session.then((ss) => phone_device(ss.cookie))
  }

  async debug(url, method, headers = {}, data, type, needCookie) {
    const ss = await this.session
    if (headers && headers['Cookie'] && needCookie) {
      if (headers['Cookie'].endsWith(';')) {
        headers['Cookie'] = `${headers['Cookie']}${ss.cookie} `
      } else {
        headers['Cookie'] = `${headers['Cookie']};${ss.cookie} `
      }
    } else if (needCookie) {
      headers = Object.assign({ Cookie: ss.cookie }, headers)
    }

    return request({
      url,
      method,
      headers,
      data,
      type
    })
  }

  async say(msg, deviceId) {
    const ss = await this.session

    if (deviceId) {
      return tts(msg, {
        cookie: ss.cookie,
        deviceId: deviceId
      })
    } else {
      if (this.liveDevice && !this.liveDevice.length) {
        this.liveDevice = await device(ss.cookie)
      }

      if (!this.liveDevice.length) {
        return Promise.resolve('无设备在线')
      }

      return tts(msg, {
        cookie: ss.cookie,
        deviceId: this.liveDevice[0].deviceID
      })
    }
  }

  async setVolume(v, deviceId) {
    const ss = await this.session
    const status = await this.checkStatus(deviceId)
    if (!status) {
      return Promise.resolve('无设备在线')
    }

    deviceId = this.valDeviceId(deviceId)

    return setVolume(v, {
      cookie: ss.cookie,
      deviceId: deviceId
    })
  }

  async findDevice(deviceId) {
    return this.session.then((ss) => find_device(ss, deviceId))
  }
  async deviceStatus(deviceId) {
    return this.session.then((ss) => device_status(ss.cookie, deviceId))
  }
  async deviceNoise(deviceId) {
    return this.session.then((ss) => device_noise(ss, deviceId))
  }
  async clipboard(msg) {
    return this.session.then((ss) => clipboard(ss, msg))
  }

  async checkStatus(deviceId) {
    const ss = await this.session

    if (deviceId) {
      // 检查一下，本地不存在设备列表就获取一次
      if (this.liveDevice && !this.liveDevice.length) {
        this.liveDevice = await device(ss.cookie)
      }

      return Promise.resolve(true)
    } else {
      if (this.liveDevice && !this.liveDevice.length) {
        this.liveDevice = await device(ss.cookie)
      }

      if (!this.liveDevice.length) {
        return Promise.resolve(false)
      }
      return Promise.resolve(true)
    }
  }

  async exec(deviceId, method) {
    const ss = await this.session
    const status = await this.checkStatus(deviceId)
    if (!status) {
      return Promise.resolve('无设备在线')
    }

    deviceId = this.valDeviceId(deviceId)

    return method({
      cookie: ss.cookie,
      deviceId: deviceId
    })
  }

  async play(deviceId) {
    return await this.exec(deviceId, play)
  }

  async pause(deviceId) {
    return await this.exec(deviceId, pause)
  }

  async playStatus(deviceId) {
    return await this.exec(deviceId, play_status)
  }

  async prev(deviceId) {
    return await this.exec(deviceId, prev)
  }

  async next(deviceId) {
    return await this.exec(deviceId, next)
  }

  async toggle(deviceId) {
    return await this.exec(deviceId, toggle)
  }

  /**
   *
   * @param {*} url
   * @param {*} type
   * @param {*} deviceId
   * @returns
   */
  async playUrl(url, type = 1, deviceId) {
    const ss = await this.session
    const status = await this.checkStatus(deviceId)
    if (!status) {
      return Promise.resolve('无设备在线')
    }

    if (!url) {
      return Promise.resolve('播放链接不能为空')
    }
    deviceId = this.valDeviceId(deviceId)

    return await payUrl(
      { url, type },
      {
        cookie: ss.cookie,
        deviceId: deviceId
      }
    )
  }

  async nlpResult(deviceId) {
    return await this.exec(deviceId, nlpResult)
  }

  async aiService(msg, tts = 0, tts_play = 0, deviceId) {
    const ss = await this.session
    const status = await this.checkStatus(deviceId)
    if (!status) {
      return Promise.resolve('无设备在线')
    }

    deviceId = this.valDeviceId(deviceId)

    return aiService(msg, tts, tts_play, {
      cookie: ss.cookie,
      deviceId: deviceId
    })
  }

  async wakeupStop(deviceId) {
    return await this.exec(deviceId, wakeupStop)
  }

  async wakeupTV(mac, deviceId) {
    const ss = await this.session
    const status = await this.checkStatus(deviceId)
    if (!status) {
      return Promise.resolve('无设备在线')
    }

    deviceId = this.valDeviceId(deviceId)

    return wakeupTV(mac, {
      cookie: ss.cookie,
      deviceId: deviceId
    })
  }

  valDeviceId(deviceId) {
    if (deviceId) {
      return deviceId
    
  }
    return this.liveDevice[0].deviceID
  }

  async conversation(limit = 1, deviceId) {
    const ss = await this.session
    const status = await this.checkStatus(deviceId)
    if (!status) {
      return Promise.resolve('无设备在线')
    }
    deviceId = this.valDeviceId(deviceId) 
    let device = this.findDeviceById(deviceId)

    return await conversation(
      { limit, hardware: device.hardware },
      {
        cookie: ss.cookie,
        deviceId: deviceId
      }
    )
  }
  
  findDeviceById(deviceId) {
    
    return this.liveDevice.find((device) => device.deviceID === deviceId)
  }
}

module.exports = XiaoAi
