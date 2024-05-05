const Xiaoai = require('./lib/XiaoAi')
const MessageProcess = require('./lib/MessageProcess')
const XiaoAiError = require('./xiaoai/XiaoAiError')
module.exports = RED => {
  // nlp-result
  RED.nodes.registerType('xiaoai-nlp-result', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)

      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig)
      node.on('input', async data => {
        for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
        data.payload = data.device || data.payload

        try {
          const res = await xiaoai.nlpResule(data.device)
          data.res = res
          node.status({ text: `获取nlp结果成功:${data._msgid}` })
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

  RED.nodes.registerType('xiaoai-nlp-conversation', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)

      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig)
      node.on('input', async data => {
        for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
        data.payload = data.device || data.payload

        try {
          const res = await xiaoai.conversation(data.limit, data.device)
          data.res = res
          if (res.code == 0 && res.data && res?.data?.records?.length > 0 && res?.data?.records[0]?.recordGroup) {
            const r = JSON.parse(res.data.records[0].recordGroup)
            data.payload = r.user.content
            data.record = r
          }
          node.status({ text: `获取对话记录成功:${data._msgid}` })
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
          console.log(err)
          node.warn(err)
          data.payload = {}
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })

  // ai service
  RED.nodes.registerType('xiaoai-ai-service', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const messageProcess = new MessageProcess(node, xiaomiConfig)
      messageProcess.changeType()

      node.on('input', data => {
        for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
        data.payload = data.message || data.payload
        // 修正数据格式
        if (data.tts) {
          data.tts = 1
        } else {
          data.tts = 0
        }

        if (data.tts_play) {
          data.tts_play = 1
        } else {
          data.tts_play = 0
        }
        messageProcess.say(data)
      })
    }
  })

  RED.nodes.registerType('xiaoai-nlp-session', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig)

      node.on('input', async data => {
        for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
        
        
        try {
          const res = await xiaoai.getSession()
          data.payload = res
          
          node.status({ text: `获取登录信息成功:${data._msgid}` })
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
          console.log(err)
          node.warn(err)
          data.payload = {}
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })

  RED.nodes.registerType('xiaoai-nlp-debug', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig)

      node.on('input', async msg => {
        const {url, method, headers, data, type, needCookie } = msg
        try {
          const res = await xiaoai.debug(url, method, headers, data, type, needCookie)
          msg.payload = res
          
          node.status({ text: `获取debug:${msg._msgid}` })
          node.send([msg, null])
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
          console.log(err)
          node.warn(err)
          msg.payload = {}
          msg.error_msg = err.message
          node.send([null, msg])
        }
      })
    }
  })
}
