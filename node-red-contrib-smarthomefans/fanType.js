const utils = require("./utils");

const CONFIG = {
    'cool': 1,
    'hot': 2,
    'fan_only':3,
    'dry': 4,
    'auto': 0,
    'unknown': 0,
    'off': 0,
    'unavailable': 0,
}

const TRAN_CONFIG = {
    1: 'cool',
    2: 'hot',
    3: 'fan_only',
    4: 'dry',
    5: 'auto',
}

function fanType(intent, payload, sendData, node) {
    let doBack = false
    if (intent === "get-properties") {
        node.hass.homeassistant
        .get(node.entityId)
        .then((info) => {
            console.log(info)
          sendData.on = info.state == 'on' ? true: false
          if (info.state === 'off' || info.state === 'unknown' || info.state === 'unavailable') {
            sendData.on = false;
            sendData.state = 1
          }else {
            sendData.on = true;
            sendData.state = 2
          }
          if (info.attributes ){
            const attr = info.attributes
            sendData.fault = 0
          }
          utils.sendToXiaoai(sendData, node)
        })
        .catch((err) => {
          console.log(`${node.entityId} 状态反馈失败: ${err}`);
        });
    } else if (intent === "set-properties") {
      tranData = tran_action(payload, node.entityId)
      if (!tranData) {
            utils.autoCallBack(sendData, node);
            return
      }
      node.hass.homeassistant.callService(tranData[0], utils.getDomain(node.entityId), tranData[1])
      .then((info) => {
        console.log(info)
        if (!doBack) {
            utils.autoCallBack(sendData, node);
        }
      })
      .catch((err) => {
        console.log(`${node.entityId} 状态反馈失败: ${err}`);
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
    }else {
        return null
    }
  }

  module.exports =  fanType