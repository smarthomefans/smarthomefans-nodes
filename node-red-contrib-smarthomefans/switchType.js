const utils = require("./utils");

function switchType(intent, payload, sendData, node) {
    let doBack = false
    if (intent === "get-properties") {
        node.hass.homeassistant
        .get(node.entityId)
        .then((info) => {
          // console.log(info)
          sendData.on = info.state == 'on' ? true: false
          sendData.state = 1
          utils.sendToXiaoai(sendData, node)
        })
        .catch((err) => {
          utils.sendToXiaoai(sendData, node)
          console.log(`${node.entityId} 状态反馈失败: ${err}`);
        });
    } else if (intent === "set-properties") {
      let action = payload.on ? 'turn_on' : 'turn_off'
      node.hass.homeassistant.callService(action, utils.getDomain(node.entityId), {"entity_id":node.entityId})
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

  module.exports = switchType