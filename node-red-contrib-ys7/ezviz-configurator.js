module.exports = (RED) => {
    RED.nodes.registerType('ezviz-configurator', class {
      constructor (config) {
        RED.nodes.createNode(this, config)
        Object.assign(this, config)
      }
    })
  }