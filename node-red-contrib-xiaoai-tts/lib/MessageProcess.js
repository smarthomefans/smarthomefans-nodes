const Xiaoai = require('./XiaoAi')
const XiaoAiError = require('../xiaoai/XiaoAiError')

class MessageProcess {
  constructor (node, config) {
    this.node = node
    this.config = config
    this.xiaoai = new Xiaoai(node, config)
    this.isCleanToken = false
    this.msgQueue = []
    this.isTTS = true
  }

  changeType () {
    this.isTTS = false
  }

  async say (msg) {
    const msgQueue = this.msgQueue
    if (msgQueue.push(msg) > 1) {
      // pending write exists
      return
    }
    try {
      this.processQ(msgQueue)
    } catch (e) {
      this.msgQueue = []
      throw e
    }
  }

  async processMsg (msg, done) {
    const node = this.node
    try {
      let res = null
      if (this.isTTS) {
        res = await this.xiaoai.tts(msg.payload, msg.device)
      } else {
        res = await this.xiaoai.aiService(msg.payload, msg.tts, msg.tts_play, msg.device)
      }

      msg.res = res
      node.status({ text: `成功:${msg._msgid}` })
      this.isCleanToken = false
      node.send([msg, null])
    } catch (err) {
      if (err instanceof XiaoAiError) {
        node.status({ text: '用户名密码错误或系统错误，请xiaomi网站登陆尝试', fill: 'red', shape: 'ring' })
        if (this.isCleanToken) {
          this.isCleanToken = false
          return
        }
      } else {
        if (err.status && err.status == '401') {
          node.status({ text: '授权信息失效', fill: 'red', shape: 'ring' })
          this.xiaoai.clean()
          // 发现上次tts成功，这次失败了，记录状态，开始重试
          if (!this.isCleanToken) {
            this.isCleanToken = true
            return
          } else {
            // 当第二次尝试tts本条数据的时候，发现登陆信息还是异常的，这时候丢弃这次消息并当tts失败
            this.isCleanToken = false
          }
        } else {
          if (this.isCleanToken) {
            this.isCleanToken = false
            return
          }
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
        }
      }

      node.warn(err)
      msg.payload = {}
      msg.error_msg = err.message
      node.send([null, msg])
    } finally {
      (function (status) {
        setTimeout(_ => {
          done(status)
        }, msg.sleepTime || 10)
      })(this.isCleanToken)
    }
  }

  async processQ (queue) {
    var msg = queue[0]
    const that = this
    this.processMsg(msg, function (status) {
      if (!status) {
        queue.shift()
      }
      if (queue.length > 0) {
        that.processQ(queue)
      }
    })
  }
}

module.exports = MessageProcess
