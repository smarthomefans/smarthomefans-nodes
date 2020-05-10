/*
 * @Author        : fineemb
 * @Github        : https://github.com/fineemb
 * @Description   : 
 * @Date          : 2020-05-11 00:05:45
 * @LastEditors   : fineemb
 * @LastEditTime  : 2020-05-11 01:16:38
 */

const Xiaoai = require('./lib/XiaoAi')
const XiaoAiError = require('./xiaoai/XiaoAiError')
module.exports = RED => {

  // tts
  RED.nodes.registerType('xiaoai-volume', class {
    constructor (config) {
        const node = this
        RED.nodes.createNode(node, config)
  
        const xiaomiConfig = RED.nodes.getNode(config.xiaoai)
        const xiaoai = new Xiaoai(node, xiaomiConfig)
        node.on('input', async data => {
          for (const key in config) { if (config[key] != '' && config[key] != null) { data[key] = config[key] } }
          data.payload = data.volume*1 || data.payload
  
          try {
            const res = await xiaoai.setVolume(data.payload, data.device)
            data.res = res
            node.status({ text: `设置音量成功:${data.payload}` })
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
