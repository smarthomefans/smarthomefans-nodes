function deviceInformation(item) {
    item.status = 0;
    switch (item.piid) {
      case 1:
        item.value = "smart-home-fans";
        break;
      case 2:
        item.value = "smartHome";
        break;
      case 3:
        item.value = "1-1-1";
        break;
      case 4:
        item.value = "1.0.0";
        break;
      default:
        break;
    }
    return item;
  }

  function sendToXiaoai(msg, node) {
    try {
      const { data, intent, deviceId, configPropertie } = msg;
      data.map((p) => {
        const { piid, siid } = p;

        if (siid === 1) {
          deviceInformation(p);
        }

        if (intent !== "get-properties" && !p.hasOwnProperty("status")) {
          p.status = 0;
        }
        const key = configPropertie[`${siid}`][`${piid}`];
        if (msg.hasOwnProperty(key)) {
          p.value = msg[key];
          p.status = 0;
        } else if (
          intent === "get-properties" &&
          !p.hasOwnProperty("status")
        ) {
          console.log(`${key} 没有找到， 指令为: ${intent}`);
          p.status = -1;
          p.description = "响应失败，请检查流程";
        }
        return p;
      });

      // console.log(data)

      if (node.account.connected) {
        node.account.mqttClient.publish(
          "smarthomefans/" +
            node.account.credentials.username +
            "/" +
            deviceId +
            "/set",
          JSON.stringify({intent, data})
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  function get_entity_domain(entity_id) {
    return entity_id.split('.')[0];
  }

  function autoCallBack(sendData, node) {
    const { data, deviceId , intent} = sendData;
    data.map((p) => {
      p.status = 0;
      return p;
    });
    if (node.account.connected) {
      node.account.mqttClient.publish(
        "smarthomefans/" +
          node.account.credentials.username +
          "/" +
          deviceId +
          "/set",
        JSON.stringify({intent, data})
      );
    }
  }

  module.exports = {deviceInformation, sendToXiaoai, getDomain: get_entity_domain, autoCallBack}