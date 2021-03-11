const utils = require("./utils");

const CONFIG = {
  0: 'stop_cover',
  1: 'open_cover',
  2: 'close_cover'
}

function fvType(intent, payload, sendData, node) {
    let doBack = false
    if (intent === "get-properties") {
      sendData.fault = 0
      sendData['motor-reverse'] = false
      sendData.state = 1
      node.hass.homeassistant
        .get(node.entityId)
        .then((info) => {
          // console.log(info)
          if (info.state == 'open' || info.state == 'close') {
            sendData['current-position'] = info.attributes.current_position
            sendData['target-position'] = info.attributes.current_position
          }else {
            sendData['current-position'] = 10
            sendData['target-position'] = 10
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
    if (payload.hasOwnProperty("motor-control")) {
      const control = payload['motor-control']
      return [CONFIG[control], {"entity_id": entityId}]
    }else {
      const position = payload['target-position']

      return ['set_cover_position', {"entity_id": entityId, position}]
    }
  }

  module.exports = fvType