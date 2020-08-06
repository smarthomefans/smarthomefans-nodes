

const Xiaoai = require('./lib/XiaoAi')
const MessageProcess = require('./lib/MessageProcess')
const XiaoAiError = require('./xiaoai/XiaoAiError')
module.exports = RED => {
  //phone list
  RED.nodes.registerType('xiaoai-phone-devices', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)

      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig, 'i.mi.com')
      node.on('input', async data => {
        try {
          const res = await xiaoai.phoneDeviceList()
          data.res = res
          node.status({ text: `获取手机列表成功:${data._msgid}` })
          node.send([data, null])
        } catch (err) {
          if (err instanceof XiaoAiError) {
            node.status({ text: '用户名密码错误，请xiaomi网站登陆尝试', fill: 'red', shape: 'ring' })
          } else {
            if (err.status && err.status == 401) {
              xiaoai.clean()
              node.status({ text: '授权信息失效, 请再试一次', fill: 'red', shape: 'ring' })
            } else {
              node.status({ text: err.message, fill: 'red', shape: 'ring' })
            }
          }
          node.warn(err)
          data.payload = {}
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })
    //find phone
    RED.nodes.registerType('xiaoai-find-devices', class {
      constructor (config) {
        const node = this
        RED.nodes.createNode(node, config)
  
        const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
        const xiaoai = new Xiaoai(node, xiaomiConfig, 'i.mi.com')
        node.on('input', async data => {
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.device = data.device || data.payload || 'all'
          try {
            const res = await xiaoai.findPhoneDevice(data.device)
            data.res = res
            node.status({ text: `查找成功:${data._msgid}` })
            node.send([data, null])
          } catch (err) {
            if (err instanceof XiaoAiError) {
              node.status({ text: '用户名密码错误，请xiaomi网站登陆尝试', fill: 'red', shape: 'ring' })
            } else {
              if (err.status && err.status == 401) {
                xiaoai.clean()
                node.status({ text: '授权信息失效, 请再试一次', fill: 'red', shape: 'ring' })
              } else {
                node.status({ text: err.message, fill: 'red', shape: 'ring' })
              }
            }
            node.warn(err)
            data.payload = {}
            data.error_msg = err.message
            node.send([null, data])
          }
        })
      }
    })
    //get phone status
    RED.nodes.registerType('xiaoai-device-status', class {
      constructor (config) {
        const node = this
        RED.nodes.createNode(node, config)
  
        const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
        const xiaoai = new Xiaoai(node, xiaomiConfig, 'i.mi.com')
        
        node.on('input', async data => {
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.device = data.device || data.payload || 'full'
          try {
            const res = await xiaoai.deviceStatus(data.device)
            data.res = res
            node.status({ text: `获取手机状态:${data._msgid}` })
            node.send([data, null])
          } catch (err) {
            if (err instanceof XiaoAiError) {
              node.status({ text: '用户名密码错误，请xiaomi网站登陆尝试', fill: 'red', shape: 'ring' })
            } else {
              if (err.status && err.status == 401) {
                xiaoai.clean()
                node.status({ text: '授权信息失效, 请再试一次', fill: 'red', shape: 'ring' })
              } else {
                node.status({ text: err.message, fill: 'red', shape: 'ring' })
              }
            }
            node.warn(err)
            data.payload = {}
            data.error_msg = err.message
            node.send([null, data])
          }
        })
      }
    })

    //phone noise
    RED.nodes.registerType('xiaoai-device-noise', class {
      constructor (config) {
        const node = this
        RED.nodes.createNode(node, config)
  
        const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
        const xiaoai = new Xiaoai(node, xiaomiConfig, 'i.mi.com')
        
        node.on('input', async data => {
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.device = data.device || data.payload || 'all'
          try {
            const res = await xiaoai.deviceNoise(data.device)
            data.res = res
            node.status({ text: `手机成功发声:${data._msgid}` })
            node.send([data, null])
          } catch (err) {
            if (err instanceof XiaoAiError) {
              node.status({ text: '用户名密码错误，请xiaomi网站登陆尝试', fill: 'red', shape: 'ring' })
            } else {
              if (err.status && err.status == 401) {
                xiaoai.clean()
                node.status({ text: '授权信息失效, 请再试一次', fill: 'red', shape: 'ring' })
              } else {
                node.status({ text: err.message, fill: 'red', shape: 'ring' })
              }
            }
            node.warn(err)
            data.payload = {}
            data.error_msg = err.message
            node.send([null, data])
          }
        })
      }
    })
        //cloud clipboard
    RED.nodes.registerType('xiaoai-device-clipboard', class {
      constructor (config) {
        const node = this
        RED.nodes.createNode(node, config)
  
        const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
        const xiaoai = new Xiaoai(node, xiaomiConfig, 'i.mi.com')
        
        node.on('input', async data => {
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.text = data.text || data.payload || ''
          try {
            const res = await xiaoai.clipboard(data.text)
            data.res = res
            node.status({ text: `手机成功发声:${data._msgid}` })
            node.send([data, null])
          } catch (err) {
            if (err instanceof XiaoAiError) {
              node.status({ text: '用户名密码错误，请xiaomi网站登陆尝试', fill: 'red', shape: 'ring' })
            } else {
              if (err.status && err.status == 401) {
                xiaoai.clean()
                node.status({ text: '授权信息失效, 请再试一次', fill: 'red', shape: 'ring' })
              } else {
                node.status({ text: err.message, fill: 'red', shape: 'ring' })
              }
            }
            node.warn(err)
            data.payload = {}
            data.error_msg = err.message
            node.send([null, data])
          }
        })
      }
    })
}
