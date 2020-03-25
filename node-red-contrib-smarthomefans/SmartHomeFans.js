const mqtt = require('mqtt')

module.exports = function (RED) {
  class SmartHomeBotConfig {
    constructor (config) {
      RED.nodes.createNode(this, config)

      this.name = config.name
      this.jsonConfig = JSON.parse(config.jsonConfig)
    }
  }
  RED.nodes.registerType('SmartHome-Bot-Config', SmartHomeBotConfig)
  class SmartHomeBotAccount {
    constructor (config) {
      RED.nodes.createNode(this, config)
      var node = this

      this.config = config
      this.devices = {}
      this.connected = false
      this.name = config.name
      if (this.credentials) {
        this.username = this.credentials.username
        this.password = this.credentials.password
      }
      this.times = 0

      node.on('close', function (removed, done) {
        try {
          this.mqttClient.end()
          this.connected = false
        } catch (e) {
        };
        node.times = 0
        done()
      })
      if (this.username && this.password && this.username.length > 1 && this.password.length > 4) {
        this.connect()
      } else {
        node.error('用户名或密码错误')
      }
    }

    connect () {
      var node = this

      try {
        var mqttOptions = {
          clientId: this.config.username + '_' + Math.random().toString(16).substr(2, 8),
          username: this.username,
          password: this.password,
          reconnectPeriod: 1000 * 60,
          clean: true
        }
        this.mqttClient = mqtt.connect('tcp://mqtt.nodered.top:50001', mqttOptions)
        this.mqttClient.on('connect', () => {
          node.connected = true
          for (var device in node.devices) {
            if (node.devices.hasOwnProperty(device)) {
              var topic = 'smarthomefans/' + node.config.username + '/' + device + '/get'
              node.mqttClient.subscribe(topic, { qos: 2 })
              node.devices[device].status({ fill: 'green', shape: 'dot', text: 'node-red:common.status.connected' })
            }
          }
        })
        this.mqttClient.on('reconnect', () => {
          if (node.connected) {
            node.connected = false
            for (var device in node.devices) {
              if (node.devices.hasOwnProperty(device)) {
                node.devices[device].status({ fill: 'yellow', shape: 'ring', text: 'node-red:common.status.connecting' })
              }
            }
          }
        })
        this.mqttClient.on('close', () => {
          if (node.connected) {
            node.connected = false
            for (var device in node.devices) {
              if (node.devices.hasOwnProperty(device)) {
                node.devices[device].status({ fill: 'red', shape: 'ring', text: 'node-red:common.status.disconnected' })
              }
            }
          }
        })
        this.mqttClient.on('error', () => {
          node.connected = false
          for (var device in node.devices) {
            if (node.devices.hasOwnProperty(device)) {
              node.devices[device].status({ fill: 'red', shape: 'ring', text: 'node-red:common.status.disconnected' })
            }
          }
        })
        this.mqttClient.on('message', (topic, message) => {
          try {
            var infoArr = topic.split('/')

            if (infoArr.length != 4) {
              return
            }
            if (infoArr[3] != 'get') {
              return
            }

            var device = node.devices[infoArr[2]]
            if (device === null || undefined === device) {
              return
            }
            device.onReceive(message)
          } catch (e) {
            console.error(e)
          }
        })
      } catch (err) {
        console.error(err)
      };
    }

    addDevice (deviceId, device) {
      this.devices[deviceId] = device
    }

    removeDevice (deviceId) {
      delete this.devices[deviceId]
    }

    getDevice (deviceId) {
      return this.devices[deviceId]
    }
  };
  RED.nodes.registerType('SmartHome-Bot-Account', SmartHomeBotAccount, { credentials: {
    username: { type: 'text' },
    password: { type: 'password' }
  }})

  class SmartHomeBot {
    constructor (config) {
      RED.nodes.createNode(this, config)
      var node = this

      this.config = config
      this.deviceId = this.config.deviceId
      this.auto = this.config.auto
      this.account = RED.nodes.getNode(this.config.account)
      this.jsonConfig = RED.nodes.getNode(this.config.jsonConfig)
      this.account.addDevice(this.deviceId, this)

      node.on('close', function (removed, done) {
        node.account.removeDevice(this.deviceId)
        done()
      })

      // eslint-disable-next-line no-unused-vars
      node.onReceive = function (msg) {
        try {
          const messageData = JSON.parse(msg.toString())
          const sendData = {}
          const intent = messageData['intent']
          sendData['intent'] = messageData['intent']
          sendData['payload'] = {}
          sendData['data'] = messageData['data']
          sendData['deviceId'] = this.deviceId
          let payload = null
          if (intent === 'get-properties') {
            payload = []
          } else if (intent === 'set-properties') {
            payload = {}
          }

          const configPropertie = this.jsonConfig.jsonConfig
          sendData['configPropertie'] = configPropertie
          const properties = messageData['data']
          properties.forEach(element => {
            const { piid, siid } = element
            if (siid === 1) {
              // 过滤设备属性信息
              return
            }
            const key = configPropertie[`${siid}`][`${piid}`]

            if (intent === 'get-properties') {
              payload.push(key)
            } else if (intent === 'set-properties') {
              payload[key] = element.value
            }
          })
          sendData['payload'] = payload
          if (intent === 'get-properties') {
            node.send([sendData, null])
          } else if (intent === 'set-properties') {
            node.send([null, sendData])
            if (node.auto) {
              autoCallBack(sendData)
            }
          }
        } catch (err) {
          console.log(err)
          this.status({ fill: 'red', shape: 'ring', text: '消息处理失败' })
          RED.comms.publish('debug', { msg: err })
        }
      }

      function autoCallBack (sendData) {
        const { data, deviceId } = sendData
        data.map(p => {
          p.status = 0
          return p
        })
        if (node.account.connected) {
          node.account.mqttClient.publish(
            'smarthomefans/' + node.account.config.username + '/' + deviceId + '/set',
            JSON.stringify(data))
        }
      }
    }
  }
  RED.nodes.registerType('SmartHome-Bot', SmartHomeBot)

  class SmartHomeBotEnd {
    constructor (config) {
      RED.nodes.createNode(this, config)
      var node = this
      this.config = config
      this.account = RED.nodes.getNode(this.config.account)

      node.on('input', function (msg) {
        try {
          const { data, intent, deviceId, configPropertie } = msg
          data.map(p => {
            const { piid, siid } = p

            if (siid === 1) {
              deviceInformation(p)
            }

            if (intent !== 'get-properties' && !p.hasOwnProperty('status')) {
              p.status = 0
            }
            const key = configPropertie[`${siid}`][`${piid}`]
            if (msg.hasOwnProperty(key)) {
              p.value = msg[key]
              p.status = 0
            } else if (intent === 'get-properties' && !p.hasOwnProperty('status')) {
              console.log(`${key} 没有找到`)
              p.status = -1
              p.description = '控制失败，请检查流程'
            }
            return p
          })

          if (node.account.connected) {
            node.account.mqttClient.publish(
              'smarthomefans/' + node.account.config.username + '/' + deviceId + '/set',
              JSON.stringify(data))
          }
        } catch (e) {
          console.error(e)
        }
      })

      function deviceInformation (item) {
        item.status = 0
        switch (item.piid) {
          case 1:
            item.value = 'smart-home-fans'
            break
          case 2:
            item.value = 'smartHome'
            break
          case 3:
            item.value = '1-1-1'
            break
          case 4:
            item.value = '1.0.0'
            break
          default:
            break
        }
        return item
      }
    }
  }
  RED.nodes.registerType('SmartHome-Bot-End', SmartHomeBotEnd)
}
