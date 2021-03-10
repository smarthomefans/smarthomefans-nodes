const utils = require("./utils");

function sensorType(intent, payload, sendData, node) {
    
    if (intent !== "get-properties") {
        return
    } 
    const entities = node.entityId.split(',')
    const allPromise = []
    for(let index in entities) {
        allPromise.push(node.hass.homeassistant
            .get(entities[index]))
    }

    Promise.all(allPromise).then((values) => {
        
        for(let p in values) {
            const entity = values[p]

            if (entity.entity_id && entity.attributes) {
                if (entity.attributes.unit_of_measurement === '°C') {
                    sendData['temperature'] = Number(entity.state)
                }else if (entity.attributes.unit_of_measurement === '%') {
                    sendData['relative-humidity'] = parseInt(entity.state)
                }else if (entity.attributes.unit_of_measurement === 'μg/m³') {
                    sendData['pm2.5-density'] = Number(entity.state)
                }
            }
        }
        utils.sendToXiaoai(sendData, node)
      });
   
  }

  module.exports = sensorType