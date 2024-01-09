const os = require("os");
const fs = require("fs");
const deviceFactory = require("./lib/deviceFactory");

module.exports = function (RED) {
  class Gree2ClimateAccount {
    constructor(config) {
      RED.nodes.createNode(this, config);
      this.devices = {};
      this.listNodes = [];
      this.connected = false;
      const node = this;

      this.config = config;
      this.name = config.name;
      if (this.credentials) {
        this.ip = this.credentials.ip;
      }

      node.on("close", function (removed, done) {
        try {
          console.log("start close ..");
          // this.gateWay.close();
        } catch (e) {}
        done();
      });
      if (this.ip && this.isValidIP(this.ip)) {
        this.connect();
      } else {
        node.error("请填写正确的ip");
        node.status({ fill: "red", shape: "dot", text: "请填写正确的ip" });
      }
    }

    isValidIP(ip) {
      let reg =
        /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      return reg.test(ip);
    }

    connect() {
      console.log("start connect ..");
      const node = this;
      const options = {};
      options.host = this.ip;
      options.listDevices = function (pack) {
        node.listNodes.forEach((n) => n.send(pack));
      };

      options.onStatus = function (data) {
        node.dealPack(data);
      };
      options.onUpdate = function (data) {
        node.dealPack(data);
      };

      options.onConnected = function (status) {
        for (let device in node.devices) {
          if (node.devices.hasOwnProperty(device)) {
            node.devices[device].status({
              fill: "green",
              shape: "dot",
              text: "node-red:common.status.connected",
            });
          }
        }
        for (let index in node.listNodes) {
          node.listNodes[index].status({
            fill: "green",
            shape: "dot",
            text: "node-red:common.status.connected",
          });
        }
      };

      this.gateWay = deviceFactory.connect(options);
    }

    dealPack(data) {
      const { mac } = data;
      const d = this.getDevice(mac);
      if (d) {
        d.onReceive(data);
      }
    }

    addDevice(deviceId, device) {
      this.devices[deviceId] = device;
      try {
        device.status({
          fill: "green",
          shape: "dot",
          text: "node-red:common.status.connected",
        });
      } catch (error) {
        console.error(error);
      }
    }

    removeDevice(deviceId) {
      delete this.devices[deviceId];
      try {
      } catch (error) {
        console.error(error);
      }
    }

    getDevice(deviceId) {
      return this.devices[deviceId];
    }

    addListNode(node) {
      this.listNodes.push(node);
    }

    removeNode(node) {
      const index = this.listNodes.indexOf(node);
      if (index > -1) {
        this.listNodes.splice(index, 1);
      }
    }
  }
  RED.nodes.registerType("Gree2Climate-Account", Gree2ClimateAccount, {
    credentials: {
      ip: { type: "text" },
    },
  });

  class Gree2Climate {
    constructor(config) {
      RED.nodes.createNode(this, config);
      const node = this;

      this.config = config;
      this.mac = this.config.mac;

      this.account = RED.nodes.getNode(this.config.account);
      this.account.addDevice(this.mac, this);

      node.on("close", function (removed, done) {
        node.account.removeDevice(this.deviceId);
        done();
      });

      node.on("input", function (msg) {
        try {
          const type = msg.type;
          const payload = msg.payload;
          switch (type) {
            case "requestDeviceStatus":
              node.account.gateWay.requestDeviceStatus(this.mac);
              break;
            case "setPower":
              node.account.gateWay.setPower(payload, this.mac);
              break;
            case "setTemp":
              node.account.gateWay.setTemp(payload, this.mac);
              break;
            case "setMode":
              node.account.gateWay.setMode(payload, this.mac);
              break;
            case "setFanSpeed":
              node.account.gateWay.setFanSpeed(payload, this.mac);
              break;
            case 'setModeWithPower':
              node.account.gateWay.setModeWithPower(payload,1 , this.mac);
              break;
            default:
              console.log("未匹配到对应指令");
          }
        } catch (e) {
          console.error(e);
        }
      });

      // eslint-disable-next-line no-unused-vars
      node.onReceive = function (data) {
        const msg = {};
        msg.payload = data;
        node.send(msg);
      };
    }
  }
  RED.nodes.registerType("Gree2Climate", Gree2Climate);

  class Gree2ClimateDeviceList {
    constructor(config) {
      RED.nodes.createNode(this, config);
      const node = this;
      this.config = config;
      this.account = RED.nodes.getNode(this.config.account);

      this.account.addListNode(node);

      node.on("close", function (removed, done) {
        this.account.removeNode(node);
        done();
      });
      node.on("input", function (msg) {
        try {
          node.account.gateWay.getSubList();
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
  RED.nodes.registerType("Gree2Climate-DeviceList", Gree2ClimateDeviceList);
};
