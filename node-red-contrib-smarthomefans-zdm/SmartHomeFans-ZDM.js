const WebSocket = require('ws');

module.exports = function (RED) {

  class ZDMConfig {
    constructor(config) {
      RED.nodes.createNode(this, config)
      var node = this
      this.io = {};
      this._inputNodes = []
      this.ws = null;
      this.serverUrl = 'wss://tuisong.smzdm.com/connect';

      this.config = config
      this.connected = false
      this.init_complite = false
      this.name = config.name
      this.lockReconnect = false;
      this.timeout = 50000
      this.timeoutObj = null
      this.serverTimeoutObj = null

      this.times = 0

      node.on('close', function (removed, done) {
        try {

          this.connected = false
        } catch (e) {
        };
        node.times = 0
        done()
      })

      this.connect()
    }

    initSocket() {
      this.ws = new WebSocket(this.serverUrl);
      let ws = this.ws
      let that = this
      let io = this.io
      let node = this
      setTimeout((function (ws) {
        return function () {
          if (ws.readyState != WebSocket.OPEN) {
            ws.close();
          }
        }
      })(ws), 15000)
      // 收到服务端消息
      ws.on('message', function incoming(data) {
        
        var msg = JSON.parse(data);
        if (msg.type && msg.type === "PONG") {
          that.reset().start();
          return;
        }
        node.handleEvent(msg)
    });

    // 建立连接
    ws.on('open', function open() {
      that.reset().start();
      console.log('open success!')
      ws.send('{"type":"JOIN","data":{"room":"chrome-plugin"}}')
  });
    
    ws.on('error', function error() {
      console.log('onerror')
      that.reconnect();
    });
    
    ws.on('close', function close() {
        console.log('onclose')
        that.reconnect();
    });
    }
    

    connect() {

      try {
        this.initSocket()
      } catch (err) {
        console.error(err)
        RED.comms.publish('debug', { msg: err})
      };
    }

    reconnect() {
      console.log('reconnect');
      if (this.lockReconnect) return;
      this.lockReconnect = true;
      setTimeout(_ => {     //没连接上会一直重连，设置延迟避免请求过多
        this.initSocket();
        this.lockReconnect = false
      }, 10000);
    }

    //心跳检测
    reset() {
      clearTimeout(this.timeoutObj);
      clearTimeout(this.serverTimeoutObj);
      return this;
    }

    start() {
      
      let ws = this.ws
      this.timeoutObj = setTimeout( _ => {
        //这里发送一个心跳，后端收到后，返回一个心跳消息，
        //onmessage拿到返回的心跳就说明连接正常
        ws.send('{"type": "PING"}');
        this.serverTimeoutObj = setTimeout(function () {//如果超过一定时间还没重置，说明后端主动断开了
          ws.close();     //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
        }, 5000)
      }, this.timeout)
    }

  };
  RED.nodes.registerType('ZDM-Config', ZDMConfig)
  ZDMConfig.prototype.registerInputNode = function(/*Node*/handler) {
    this._inputNodes.push(handler);
}

ZDMConfig.prototype.removeInputNode = function(/*Node*/handler) {
    this._inputNodes.forEach(function(node, i, inputNodes) {
        if (node === handler) {
            inputNodes.splice(i, 1);
        }
    });
}

ZDMConfig.prototype.handleEvent = function(data) {
  let msg = {}
  
  msg.payload = data
  for (var i = 0; i < this._inputNodes.length; i++) {
      this._inputNodes[i].filter(msg);
  }
}

  class ZDMBot {
    constructor(config) {
      RED.nodes.createNode(this, config)
      var node = this

      this.config = config
      this.keywords = config.keywords;
      this.account = RED.nodes.getNode(this.config.account)
      
      this.account.registerInputNode(this)

      node.on('close', function (removed, done) {
        node.account.removeInputNode(node);
        done()
      })
    }


    filter(msg) {
      // 
      const items = msg.payload.data.items
      
      if (!this.keywords) {
        
        for (var i = 0; i < items.length; i++) {
          let item = items[i]
          let content = item.content
          content.type = item.type;
          let newMsg = {}
          newMsg.payload = content
          this.send(newMsg)
        }
      } else {
        
        if (items.length > 0) {
          

          for (var i = 0; i < items.length; i++) {
            let item = items[i]
            let content = item.content
            const {msg_title, msg_desc} = content;

            if ((msg_title && msg_title.indexOf(this.keywords) > -1) ||  (msg_desc && msg_desc.indexOf(this.keywords) > -1)) {
              content.type = item.type;
              let newMsg = {}
              newMsg.payload = content
              this.send(newMsg)
            }
          }
        }else {
          RED.comms.publish('debug', { msg: 'item is null' })
        }

      }
    }
  }
  RED.nodes.registerType('ZDM-Bot', ZDMBot)

  


}
