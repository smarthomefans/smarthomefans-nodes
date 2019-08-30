const Xiaoai = require('./lib/XiaoAi')

module.exports = RED => {

  
  // devices list
  RED.nodes.registerType('xiaoai-devices', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      
      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig)
      node.on('input', async data => {
        try {
          const res = await xiaoai.deviceList()
          data.res = res
          node.status({ text: `获取设备列表成功:${data._msgid}` })
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


  // tts
  RED.nodes.registerType('xiaoai-tts', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
      const xiaoai = new Xiaoai(node, xiaomiConfig)
      node.msgQueue = [];
      node.on('input', data => {
        for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
        data.payload = data.tts || data.payload

        let msgQueue = node.msgQueue;
        if (msgQueue.push(data) > 1) {
            // pending write exists
            return;
        }
        try {
            processQ(msgQueue);
        }
        catch (e) {
            node.msgQueue = [];
            throw e;
        }
      })

      async function processMsg(msg, done) {
        try {

          const res = await xiaoai.tts(msg.payload, msg.device)
          msg.res = res
          node.status({ text: `tts 成功:${msg._msgid}` })
          node.send([msg, null])
        } catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          msg.payload = {}
          msg.error_msg = err.message
          node.send([null, msg])
        }
        done()
      }

      function processQ(queue) {
        var msg = queue[0];
        processMsg(msg, function() {
            queue.shift();
            if (queue.length > 0) {
                processQ(queue);
            }
        });
      }
    }
  })

}
