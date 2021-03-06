const utils = require("./utils");
const colorUtils = require('./color')

function colorLightType(intent, payload, sendData, node) {
    let doBack = false
    if (intent === "get-properties") {
        node.hass.homeassistant
        .get(node.entityId)
        .then((info) => {
          sendData.on = info.state == 'on' ? true: false
          if (info.attributes ){
            const attr = info.attributes
            // console.log((attr.brightness || 0) / 256 * 100)
            sendData.brightness = parseInt((attr.brightness || 0) / 256 * 100)
            sendData.color = colorUtils.rgbToInt(attr.rgb_color || [0, 0, 0])
          }
          utils.sendToXiaoai(sendData, node)
        })
        .catch((err) => {
          utils.sendToXiaoai(sendData, node)
          console.log(`${node.entityId} 状态反馈失败: ${err}`);
        });
    } else if (intent === "set-properties") {
      // console.log(payload)
      tranData = tran_action(payload, node.entityId)
      // console.log(tranData)
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
      const data = {"entity_id": entityId}
      if (payload.hasOwnProperty('brightness')) {
        brightness = payload['brightness'] /100 * 256
        data['brightness'] = brightness
      }
      return [control, data]
    }else if(payload.hasOwnProperty('brightness')){
      const brightness = payload['brightness'] /100 * 256
      return ['turn_on', {"entity_id": entityId, brightness}]
    }else if(payload.hasOwnProperty('color')){
        const rgb_color = colorUtils.hexToRgb(colorUtils.decimalToHex(payload['color']))
      return ['turn_on', {"entity_id": entityId, rgb_color}]
    }else {
        return ['turn_on', {"entity_id": entityId}]
    }
  }

  module.exports = colorLightType