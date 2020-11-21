const DnsPods = require('./lib/DnsPods')

module.exports = RED => {
  // config
  RED.nodes.registerType('dnspod-server', class {
    constructor (config) {
      RED.nodes.createNode(this, config)
      Object.assign(this, config)
    }
  })

  //  更新 dns
  RED.nodes.registerType('dnspod', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const server = RED.nodes.getNode(config.server)
      const dns = new DnsPods(node, server)
      node.on('input', async data => {
        try {
          

          // 合并值,未细想
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          

          const res = await dns.update(data)
          node.status({ text: '更新成功', fill: ' gree', shape: 'ring' })
          data.payload = res
          data.stauts = 0
          node.send(data)
          
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = err.message
          data.stauts = -1
          node.send(data)
          
        }
      })
    }
  })

 


}
