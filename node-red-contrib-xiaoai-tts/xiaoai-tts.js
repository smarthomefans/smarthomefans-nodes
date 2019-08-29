module.exports = RED => {
  // tts
  RED.nodes.registerType('xiaoai-tts', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      node.on('input', async data => {
        try {
          // 合并值,未细想
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.payload = data.deviceSerial || data.payload
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

  // devices list
  RED.nodes.registerType('xiaoai-devices', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      node.on('input', async data => {
        try {

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
