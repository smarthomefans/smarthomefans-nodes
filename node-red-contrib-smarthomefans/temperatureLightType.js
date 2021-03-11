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
          }
          utils.sendToXiaoai(sendData, node)
        })
        .catch((err) => {
          utils.sendToXiaoai(sendData, node)
          console.log(`${node.entityId} 状态反馈失败: ${err}`);
        });
    } else if (intent === "set-properties") {
      tranData = tran_action(payload, node.entityId)
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

  function tran_action(payload, entityId) {
    if (payload.hasOwnProperty("on")) {
      const control = payload.on ? 'turn_on' : 'turn_off'
      return [control, {"entity_id": entityId}]
    }else if(payload.hasOwnProperty('brightness')){
      const brightness = payload['brightness'] /100 * 256
      return ['turn_on', {"entity_id": entityId, brightness}]
    }else {
      return ['turn_on', {"entity_id": entityId}]
    }
  }

  module.exports = temperatureLightType