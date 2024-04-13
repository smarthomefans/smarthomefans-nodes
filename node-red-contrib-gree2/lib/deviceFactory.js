const dgram = require("dgram");
const encryptionService = require("./encryptionService")();
const cmd = require("./commandEnums");

/**
 * Class representing a single connected device
 */
class Device {
  /**
   * Create device model and establish UDP connection with remote host
   * @param {object} [options] Options
   * @param {string} [options.address] HVAC IP address
   * @callback [options.onStatus] Callback function run on each status update
   * @callback [options.onUpdate] Callback function run after command
   * @callback [options.onConnected] Callback function run once connection is established
   */
  constructor(options) {
    //  Set defaults
    this.options = {
      host: options.host || "192.168.1.255",
      onStatus: options.onStatus || function () {},
      onUpdate: options.onUpdate || function () {},
      onConnected: options.onConnected || function () {},
      listDevices: options.listDevices || function () {},
    };

    /**
     * Device object
     * @typedef {object} Device
     * @property {string} id - ID
     * @property {string} name - Name
     * @property {string} mac - mac
     * @property {string} address - IP address
     * @property {number} port - Port number
     * @property {boolean} bound - If is already bound
     * @property {object} props - Properties
     */
    this.device = {};
    this.index = 1;
    this.socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

    // Initialize connection and bind with device
    this._connectToDevice(this.options.host);

    // Handle incoming messages
    this.socket.on("message", (msg, rinfo) => this._handleResponse(msg, rinfo));
    this.socket.on("error", (err) => {
      console.log("[UDP] Socket Connected error: " + err);
      // 链接异常，重新链接
      this.socket.close();
      this.options.onConnected(false);
      //
      this.device.bound = false;
      this.device.key = null;
      this._connectToDevice(this.options.host);
    });
  }

  close() {
    try {
      this.socket.close();
      // server.close();
    } catch (e) {}
  }

  /**
   * Initialize connection
   * @param {string} address - IP/host address
   */
  _connectToDevice(address) {
    try {
      this.socket.bind(() => {
        const message = Buffer.from(JSON.stringify({ t: "scan" }));

        this.socket.setBroadcast(true);
        this.socket.send(message, 0, message.length, 7000, address);

        console.log("[UDP] Connected to device at %s", address);
      });
    } catch (err) {
      const timeout = 60;

      console.log(
        "[UDP] Unable to connect (" +
          err.message +
          "). Retrying in " +
          timeout +
          "s..."
      );
      setTimeout(() => {
        this._connectToDevice(address);
      }, timeout * 1000);
    }
  }

  /**
   * Register new device locally
   * @param {string} id - CID received in handshake message
   * @param {string} name - Device name received in handshake message
   * @param {string} mac - Device mac received in handshake message
   * @param {string} address - IP/host address
   * @param {number} port - Port number
   */
  _setDevice(id, name, mac, address, port) {
    this.device.id = id || "app";
    this.device.name = name;
    this.device.address = address;
    this.device.mac = mac;
    this.device.port = port;
    this.device.bound = false;
    this.device.props = {};

    console.log("[UDP] New device registered: %s", this.device.name);
  }

  /**
   * Send binding request to device
   * @param {Device} device Device object
   */
  _sendBindRequest(device) {
    const message = {
      mac: this.device.id,
      t: "bind",
      uid: 0,
    };
    const encryptedBoundMessage = encryptionService.encrypt(message);
    const request = {
      cid: "app",
      i: this.index++,
      t: "pack",
      uid: 0,
      pack: encryptedBoundMessage,
    };
    const toSend = Buffer.from(JSON.stringify(request));
    this.socket.send(toSend, 0, toSend.length, device.port, device.address);
  }

  /**
   * Confirm device is bound and update device status on list
   * @param {String} id - Device ID
   * @param {String} key - Encryption key
   */
  _confirmBinding(id, key) {
    this.device.bound = true;
    this.device.key = key;
    console.log("[UDP] Device %s is bound!", this.device.name);
  }

  /**
   * Confirm device is bound and update device status on list
   * @param {Device} device - Device
   */
  requestDeviceStatus(mac) {
    if (!this.device.bound) {
      console.log("[UDP] Device %s is unbound!", this.device.name);
      return;
    }
    const cmds = ["Pow", "Mod", "SetTem", "WdSpd", "Air", "SwhSlp", "Quiet"];
    const message = {
      cols: cmds,
      mac: mac || this.device.id,
      t: "status",
    };
    this._sendRequest(message, this.device.address, this.device.port);
  }

  /**
   * Handle UDP response from device
   * @param {string} msg Serialized JSON string with message
   * @param {object} rinfo Additional request information
   * @param {string} rinfo.address IP/host address
   * @param {number} rinfo.port Port number
   */
  _handleResponse(msg, rinfo) {
    const message = JSON.parse(msg + "");

    // Extract encrypted package from message using device key (if available)
    if (!message.pack) {
      console.log("[UDP] Unknown message of type %s", message);
      return;
    }

    const pack = encryptionService.decrypt(message, (this.device || {}).key);
    // console.log(
    //   "[UDP] decrypt message %s: %s, %s",
    //   pack.t,
    //   message,
    //   JSON.stringify(pack)
    // );

    // If package type is response to handshake
    if (pack.t === "dev") {
      this._setDevice(
        message.cid,
        pack.name,
        pack.mac,
        rinfo.address,
        rinfo.port
      );
      this._sendBindRequest(this.device);
      return;
    }

    // If package type is binding confirmation
    if (pack.t === "bindOk" && this.device.id) {
      this._confirmBinding(message.cid, pack.key);
      this.options.onConnected(true);
      return;
    }
    // get sub list devices
    if (pack.t === "subList") {
      this.device.props.list = pack.list;
      this.options.listDevices(pack);
      return;
    }

    // If package type is device status
    if (pack.t === "dat" && this.device.bound) {
      // pack.cols.forEach((col, i) => {
      //   this.device.props[col] = pack.dat[i]
      // })
      this.options.onStatus(pack);
      return;
    }

    // If package type is response, update device properties
    if (pack.t === "res" && this.device.bound) {
      // pack.opt.forEach((opt, i) => {
      //   this.device.props[opt] = pack.val[i]
      // })
      this.options.onUpdate(pack);
      return;
    }

    console.log(
      "[UDP] Unknown message of type %s: %s, %s",
      pack.t,
      message,
      JSON.stringify(pack)
    );
  }

  /**
   * Send commands to a bound device
   * @param {string[]} commands List of commands
   * @param {number[]} values List of values
   */
  _sendCommand(commands = [], values = [], mac = "") {
    if (!this.device.bound) {
      console.log("[UDP] Device %s is unbound!", this.device.name);
      return;
    }
    const message = {
      opt: commands,
      p: values,
      sub: mac,
      t: "cmd",
    };
    this._sendRequest(message);
  }

  /**
   * get subList
   */
  getSubList(index = 0) {
    if (!this.device.bound) {
      console.log("[UDP] Device %s is unbound!", this.device.name);
      return;
    }
    const message = {
      t: "subDev",
      mac: this.device.mac,
      i: index,
    };
    this._sendRequest(message);
  }

  /**
   * Send request to a bound device
   * @param {object} message
   * @param {string[]} message.opt
   * @param {number[]} message.p
   * @param {string} message.t
   * @param {string} [address] IP/host address
   * @param {number} [port] Port number
   */
  _sendRequest(
    message,
    address = this.device.address,
    port = this.device.port
  ) {
    const encryptedMessage = encryptionService.encrypt(
      message,
      this.device.key
    );
    const request = {
      cid: "app",
      i: 0,
      t: "pack",
      uid: 0,
      tcid: this.device.mac,
      pack: encryptedMessage,
    };

    // console.log("=================================");
    // console.log("request message: %s", JSON.stringify(message));
    // console.log("reuest pack: %s", JSON.stringify(request));
    // console.log("=================================");

    const serializedRequest = Buffer.from(JSON.stringify(request));
    this.socket.send(serializedRequest, 0, serializedRequest.length, port, address);
  }

  /**
   * Turn on/off
   * @param {boolean} value State
   */
  setPower(value, mac) {
    this._sendCommand([cmd.power.code], [value ? 1 : 0], mac);
  }

  /**
   * Set temperature
   * @param {number} value Temperature
   * @param {number} [unit=0] Units (defaults to Celsius)
   */
  setTemp(value, mac) {
    this._sendCommand([cmd.temperature.code], [value], mac);
  }

  /**
   * Set mode
   * @param {number} value Mode value (0-4)
   */
  setMode(value, mac) {
    this._sendCommand([cmd.mode.code], [value], mac);
  }

  setModeWithPower(value,power, mac) {
    this._sendCommand([cmd.mode.code, cmd.power.code], [value, power], mac);
  }

  /**
   * Set fan speed
   * @param {number} value Fan speed value (0-5)
   */
  setFanSpeed(value, mac) {
    this._sendCommand([cmd.fanSpeed.code], [value], mac);
  }

  /**
   * Set horizontal swing
   * @param {number} value Horizontal swing value (0-7)
   */
  setSwingHor(value, mac) {
    this._sendCommand([cmd.swingHor.code], [value], mac);
  }

  /**
   * Set vertical swing
   * @param {number} value Vertical swing value (0-11)
   */
  setSwingVert(value, mac) {
    this._sendCommand([cmd.swingVert.code], [value], mac);
  }

  /**
   * Set power save mode
   * @param {boolean} value on/off
   */
  setPowerSave(value, mac) {
    this._sendCommand([cmd.powerSave.code], [value ? 1 : 0], mac);
  }

  /**
   * Set lights on/off
   * @param {boolean} value on/off
   */
  setLights(value, mac) {
    this._sendCommand([cmd.lights.code], [value ? 1 : 0], mac);
  }

  /**
   * Set health mode
   * @param {boolean} value on/off
   */
  setHealthMode(value, mac) {
    this._sendCommand([cmd.health.code], [value ? 1 : 0], mac);
  }

  /**
   * Set quiet mode
   * @param {boolean} value on/off
   */
  setQuietMode(value, mac) {
    this._sendCommand([cmd.quiet.code], [value], mac);
  }

  /**
   * Set blow mode
   * @param {boolean} value on/off
   */
  setBlow(value, mac) {
    this._sendCommand([cmd.blow.code], [value ? 1 : 0], mac);
  }

  /**
   * Set air valve mode
   * @param {boolean} value on/off
   */
  setAir(value, mac) {
    this._sendCommand([cmd.air.code], [value], mac);
  }

  /**
   * Set sleep mode
   * @param {boolean} value on/off
   */
  setSleepMode(value, mac) {
    this._sendCommand([cmd.sleep.code], [value ? 1 : 0], mac);
  }

  /**
   * Set turbo mode
   * @param {boolean} value on/off
   */
  setTurbo(value, mac) {
    this._sendCommand([cmd.turbo.code], [value ? 1 : 0], mac);
  }
}

module.exports.connect = function (options) {
  return new Device(options);
};
