const configTypes = require("./config");
const Homeassistant = require("./Homeassistant");
const utils = require("./utils");
const switchType =  require('./switchType')
const fanType = require('./fanType')
const fvType = require('./fvType')
const sensorType = require('./sensorType')
const colorLightType = require('./colorLightType')
const temperatureLightType = require('./temperatureLightType')
const conditionerType = require('./conditionerType')
module.exports = function (RED) {
  class FanyiBot {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.node = this;
      var node = this

      this.config = config;
      this.deviceId = this.config.deviceId;
      this.auto = this.config.auto;
      this.account = RED.nodes.getNode(this.config.account);
      this.hass = RED.nodes.getNode(this.config.hass);
    
      this.deviceType = this.config.jsonConfig;
      this.jsonConfig = configTypes[this.config.jsonConfig];
      this.entityId = this.config.entityId;
      try {
        this.entityId = this.entityId.trim()
      } catch (error) {
        console.log(error)
      }
      // console.log(this.jsonConfig)
      this.account.addDevice(this.deviceId, this);

      node.on("close", function (removed, done) {
        node.account.removeDevice(this.deviceId);
        done();
      });

      // eslint-disable-next-line no-unused-vars
      node.onReceive = function (msg) {
        try {
          const messageData = JSON.parse(msg.toString());
          console.log(messageData)
          const sendData = {};
          const intent = messageData["intent"];
          sendData["intent"] = messageData["intent"];
          sendData["payload"] = {};
          sendData["data"] = messageData["data"];
          sendData["deviceId"] = this.deviceId;
          let payload = null;
          if (intent === "get-properties") {
            payload = [];
          } else if (intent === "set-properties") {
            payload = {};
          }

          const configPropertie = this.jsonConfig;
          sendData["configPropertie"] = configPropertie;
          const properties = messageData["data"];
          properties.forEach((element) => {
            const { piid, siid } = element;
            if (siid === 1) {
              // 过滤设备属性信息
              return;
            }
            const key = configPropertie[`${siid}`][`${piid}`];

            if (intent === "get-properties") {
              payload.push(key);
            } else if (intent === "set-properties") {
              payload[key] = element.value;
            }
          });
          sendData["payload"] = payload;

          switch (this.deviceType) {
            case "switchType":
              switchType(intent, payload, sendData, node);
              break;
            case "plug":
              switchType(intent, payload, sendData, node);
              break;
            case 'fan':
                fanType(intent, payload, sendData, node);
              break
            case 'fv':
                fvType(intent, payload, sendData, node);
              break
            case 'sensor':
              sensorType(intent, payload, sendData, node);
              break
            case 'colorLight':
              colorLightType(intent, payload, sendData, node);
              break;
            case 'temperatureLight':
              temperatureLightType(intent, payload, sendData, node);
              break
            case 'conditioner':
              conditionerType(intent, payload, sendData, node);
              break
            default:
              node.status({
                fill: "red",
                shape: "ring",
                text: "没有找到对应的处理类型",
              });
          }
        } catch (err) {
          console.log(err);
          node.status({ fill: "red", shape: "ring", text: "消息处理失败" });
          RED.comms.publish("debug", { msg: err });
        }
      };
    }
    
  }
  RED.nodes.registerType("Fanyi-Bot", FanyiBot);

  class FanyiHassConfig {
    constructor(config) {
      RED.nodes.createNode(this, config);

      this.name = config.name;
      this.url = config.url;
      this.token = config.token;
      var node = this;

      this.homeassistant = new Homeassistant(this.url, this.token);

      this.homeassistant
        .info()
        .then((info) => {
          node.log(`链接成功，hass 版本: ${info.version}`);
          node.status({
            fill: "green",
            shape: "dot",
            text: `连接成功，hass 版本: ${info.version}`,
          });
        })
        .catch((err) => {
          node.error(`hass配置出错， 访问地址或Token错误: ${err}`);
          node.status({
            fill: "green",
            shape: "dot",
            text: `hass配置出错，访问地址或Token错误: ${err}`,
          });
        });
    }
  }
  RED.nodes.registerType("Fanyi-Hass-Config", FanyiHassConfig);
};
