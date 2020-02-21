const GitAction = require('./GitAction')


module.exports = RED => {
  // monitor 监控
  RED.nodes.registerType('git-nodes-backup', class {
    constructor (config) {
      const node = this
      RED.nodes.createNode(node, config)
      this.git = RED.nodes.getNode(config.git);
      this.name = config.name
      this.branch = config.branch
      this.sourcebranch = config.sourcebranch
      this.gitrmcache = config.gitrmcache
      this.gitadd = config.gitadd
      this.debugging = config.debugging
      node.on('input', async data => {
        try {
          const gitAction = new GitAction(node, this.git)

          let message = data.payload || config.payload

          if (!message) {
            message = new Date().toLocaleDateString()
          }

          gitAction.sync(message, RED)
        

        }catch (err) {
          node.status({ text: err.message, fill: 'red', shape: 'ring' })
          node.warn(err)
          data.payload = {}
          data.status = -1
          data.error_msg = err.message
          node.send([data])
        }
      })
    }
  })
}

