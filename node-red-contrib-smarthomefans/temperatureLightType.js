const utils = require("./utils");

function temperatureLightType(intent, payload, sendData, node) {
    let doBack = false
    if (intent === "get-properties") {
        node.hass.homeassistant
        .get(node.entityId)
        .then((info) => {
          sendData.on = info.state == 'on' ? true: false
          if (info.attributes ){
            const attr = info.attributes
            sendData.brightness = parseInt((attr.brightness || 0) / 256 * 100)
            let rang = attr.max_mireds || 0 - attr.min_mireds || 0
            if (rang > 0) {
              sendData['color-temperature'] = parseInt((info.attributes.color_temp || 0) / rang * 9000 + 1000)
            }
            const global = node.context().global
            global.set(`xiaoai-${node.entityId}`, attr)
          }
          utils.sendToXiaoai(sendData, node)
        })
        .catch((err) => {
          utils.sendToXiaoai(sendData, node)
          console.log(`${node.entityId} 状态反馈失败: ${err}`);
        });
    } else if (intent === "set-properties") {
      tranData = tran_action(payload, node.entityId, node)
      node.hass.homeassistant.callService(tranData[0], utils.getDomain(node.entityId), tranData[1])
      .then((info) => {
        // console.log(info)
        if (!doBack) {
            utils.autoCallBack(sendData, node);
        }
      })
      .catch((err) => {
        console.log(`${node.entityId} 控制设备失败: ${err}`);
        sendData.data[0]['status'] = -1
        utils.sendToXiaoai(sendData, node)
      });
      if (node.auto && doBack) {
        utils.autoCallBack(sendData, node);
        doBack = true
      } 
    }
  }



  function tran_action(payload, entityId, node) {
    let control = 'turn_on'
    const data = {"entity_id": entityId}
    if (payload.hasOwnProperty("on")) {
      control = payload.on ? 'turn_on' : 'turn_off'
    }
    if(payload.hasOwnProperty('brightness')){
      const brightness = payload['brightness'] /100 * 256
      data['brightness'] = brightness
    }

    if (payload.hasOwnProperty('color-temperature')) {
      const global = node.context().global
      const attr = global.get(`xiaoai-${node.entityId}`) || {}

      let colorTemp = 0
      if (attr.max_mireds && attr.min_mireds) {
        colorTemp = payload['color-temperature'] /9000 * (attr.max_mireds - attr.min_mireds)
      }else {
        colorTemp = payload['color-temperature'] /9000 * (500 - 153)
      }
      data['color_temp'] = colorTemp
    }

    return [control, data]
  }

  module.exports = temperatureLightType