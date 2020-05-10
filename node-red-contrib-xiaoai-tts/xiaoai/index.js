const login = require('./login')
const device = require('./device')
const tts = require('./tts')
const setVolume = require('./volume')
const { play, pause, play_status, prev, next, toggle } = require('./mediaplayer')
const { nlpResult, aiService } = require('./mibrain')
const { wakeupTV, wakeupStop } = require('./tv')
const { isObject } = require('./utils')

class XiaoAi {
  constructor (user, pwd) {
    if (isObject(user)) {
      const { userId, serviceToken } = user

      if (!userId || !serviceToken) throw new Error('参数不合法')

      this.session = login({ userId, serviceToken })
    } else {
      if (!user || !pwd) throw new Error('参数不合法')

      this.session = login(user, pwd)
    }

    this.liveDevice = []
  }

  connect () {
    return this.session.then(ss => ({
      userId: ss.userId,
      serviceToken: ss.serviceToken
    }))
  }

  async getDevice (name) {
    return this.session.then(ss => device(ss.cookie))
  }

  async say (msg, deviceId) {
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

  async setVolume (v, deviceId) {
    // console.log('volume:'+v)
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

  async checkStatus (deviceId) {
    const ss = await this.session

    if (deviceId) {
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

  async exec (deviceId, method) {
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

  async play (deviceId) {
    return await this.exec(deviceId, play)
  }

  async pause (deviceId) {
    return await this.exec(deviceId, pause)
  }

  async playStatus (deviceId) {
    return await this.exec(deviceId, play_status)
  }

  async prev (deviceId) {
    return await this.exec(deviceId, prev)
  }

  async next (deviceId) {
    return await this.exec(deviceId, next)
  }

  async toggle (deviceId) {
    return await this.exec(deviceId, toggle)
  }

  async nlpResult (deviceId) {
    return await this.exec(deviceId, nlpResult)
  }

  async aiService (msg, tts = 0, tts_play = 0, deviceId) {
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

  async wakeupStop (deviceId) {
    return await this.exec(deviceId, wakeupStop)
  }

  async wakeupTV (mac, deviceId) {
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

  valDeviceId (deviceId) {
    if (deviceId) {
      return deviceId
    }
    return this.liveDevice[0].deviceID
  }
}

module.exports = XiaoAi
