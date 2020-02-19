const GpsApi = require('./lib/GpsApi')

module.exports = RED => {
  // monitor 监控
  RED.nodes.registerType('gpsoo-monitor', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const server = RED.nodes.getNode(config.server)
      node.on('input', async data => {
        try {
          const bd = new GpsApi(node, server)

          // 合并值
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }

          // monitor
          const d = await bd.monitor()
          data.payload = {}
          data.payload.status = 1
          data.payload.dataArray = d
          const objData = {}
          if (d && d.length > 0) {
            data.payload.data = d[0]

            d.forEach(element => {
              objData[element.imei] = element
            })
          }
          data.objData = objData

          node.status({ text: `获取成功:${data._msgid}` })
          node.send([data, null])
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = {}
          data.status = -1
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })

  // captureImage
  // address 地理位置逆解析
  RED.nodes.registerType('gpsoo-address', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const server = RED.nodes.getNode(config.server)
      node.on('input', async data => {
        try {
          const bd = new GpsApi(node, server)

          // 合并值
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }

          if (!data.longitude && !data.latitude) {
            node.status({ text: '未传入正确的经纬度信息', fill: 'red', shape: 'ring' })
            return
          }

          // address
          const d = await bd.address(data.longitude, data.latitude)
          data.payload = {}
          data.payload.status = 1
          data.payload.data = d
          node.status({ text: `获取成功:${data._msgid}` })
          node.send([data, null])
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = {}
          data.status = -1
          data.error_msg = err.message
          node.send([null, data])
        }
      })
    }
  })
}
