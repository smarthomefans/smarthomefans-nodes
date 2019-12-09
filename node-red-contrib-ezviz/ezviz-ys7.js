const Ezviz = require('./lib/Ezviz')

module.exports = RED => {
  // 获取开门记录
  RED.nodes.registerType('ezviz-ys7', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const ezviz = RED.nodes.getNode(config.ezviz)
      node.on('input', async data => {
        try {
          const bd = new Ezviz(node, ezviz)

          // 合并值,未细想
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.payload = data.deviceSerial || data.payload

          // 开门记录
          const open = await bd.openList(data)
          data.payload = open
          node.status({ text: `获取成功:${data._msgid}` })
          node.send([data, null])
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = {}
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })

  // captureImage
  // 抓拍设备当前画面
  RED.nodes.registerType('ezviz-capture', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const ezviz = RED.nodes.getNode(config.ezviz)
      node.on('input', async data => {
        try {
          const bd = new Ezviz(node, ezviz)

          // 合并值,未细想
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.payload = data.deviceSerial || data.payload

          const imagePath = await bd.captureImage(data)
          data.payload = imagePath
          node.status({ text: `获取成功:${data._msgid}` })
          node.send([data, null])
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = {}
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })
  // presetMove
  // 云台移动到预置点
  RED.nodes.registerType('ezviz-preset-move', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const ezviz = RED.nodes.getNode(config.ezviz)
      node.on('input', async data => {
        try {
          const bd = new Ezviz(node, ezviz)

          // 合并值,未细想
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.payload = data.deviceSerial || data.payload

          const result = await bd.presetMove(data)
          data.payload = result
          node.status({ text: `操作成功:${data._msgid}` })
          node.send([data, null])
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = {}
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })
}
