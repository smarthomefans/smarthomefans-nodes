module.exports = (RED) => {
  RED.nodes.registerType('gpsoo-configurator', class {
    constructor (config) {
      RED.nodes.createNode(this, config)
      Object.assign(this, config)
    }
  })
}
