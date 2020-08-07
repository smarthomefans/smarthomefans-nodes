const XiaoAiApi = require('../xiaoai')
const fs = require('fs')
const util = require('util')
const os = require('os')
const readAsync = util.promisify(fs.readFile)
const mkdirp = require('mkdirp')

class XiaoAi {
  constructor (node, config, sid) {
    this.node = node
    this.config = config
    this.sid = sid
  }

  // 登录
  getSession () {
    return new Promise(async (resolve, reject) => {
      try {
        const parentDir = `${os.homedir()}/.node-red/xiaoai`
        // 创建存储目录
        mkdirp.sync(parentDir)
        const path = `${parentDir}/${this.config.username}`
        let jsonData
        try {
          const data = await readAsync(path)
          jsonData = JSON.parse(data)
        } catch (error) {
          jsonData = null
        }

        if (!jsonData || !jsonData.serviceToken || !jsonData.userId) {
          this.client = new XiaoAiApi(this.config.credentials.username, this.config.credentials.password, this.sid)
          jsonData = await this.client.connect()
          fs.writeFileSync(path, JSON.stringify(jsonData))
        } else {
          const { userId, serviceToken } = jsonData
          this.client = new XiaoAiApi({ userId, serviceToken })
        }

        resolve(jsonData)
      } catch (err) {
        reject(err)
      }
    })
  }

  clean () {
    try {
      const parentDir = `${os.homedir()}/.node-red/xiaoai`
      // 清空缓存
      mkdirp.sync(parentDir)
      const path = `${parentDir}/${this.config.username}`
      fs.writeFileSync(path, JSON.stringify({}))
      this.client = null
    } catch (error) {
      // ignore
    }
  }

  tts (msg, deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.say(msg, deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  setVolume (v, deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.setVolume(v, deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  deviceList () {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.getDevice()
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  phoneDeviceList () {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.getPhoneDevice()
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  findPhoneDevice(deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.findDevice(deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  deviceStatus(deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.deviceStatus(deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  deviceNoise(deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.deviceNoise(deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }
  clipboard(msg) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.clipboard(msg)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  nlpResule (deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.nlpResult(deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  aiService (message, tts, tts_play, deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.aiService(message, tts, tts_play, deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  wakteupTV (mac, deviceId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.client) {
          await this.getSession()
        }

        const data = await this.client.wakeupTV(mac, deviceId)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  mediaplayer (action) {
    return this.client[action]
  }

  async mediaplayer1 (action, device) {
    return await this.client[action](device)
  }
}

module.exports = XiaoAi
