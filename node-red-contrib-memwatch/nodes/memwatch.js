module.exports = function(RED) {
    const settings = RED.settings;
    const memwatch = require('@airbnb/node-memwatch');
    const heapdump = require('heapdump');

    let userDir = ''
    if (RED.settings.userDir) {
      userDir = RED.settings.userDir
    }
    else {
      userDir = process.env.HOME + '/.node-red'
    }

    function GC(n) {
        RED.nodes.createNode(this,n);
        const node = this;
        this.name = n.name;

        node.on("input", function(msg) {
            try {
                msg.data = memwatch.gc()
                msg.payload = 'success'

            } catch (error) {
                msg.payload = error.message
            }

            node.send(msg)
        });

    }

    RED.nodes.registerType("gc",GC);

    function Stats(n) {
        RED.nodes.createNode(this,n);
        const node = this;
        this.name = n.name;
      
        const stats = (stats) => { 
            const msg = {}
            msg.payload = stats;
            node.send(msg)
        }

        memwatch.on('stats', stats)

        this.on("close", function() {
            // Remove the statistic handler function
            gc.removeListener('stats', stats);
        });

    }

    RED.nodes.registerType("stats",Stats);


    function Leak(n) {
        RED.nodes.createNode(this,n);
        const node = this;
        this.name = n.name;


        const leak = (info) => { 
            const msg = {}
            msg.payload = info;
            node.send(msg)
        }

        memwatch.on('leak', leak)

        this.on("close", function() {
            // Remove the statistic handler function
            gc.removeListener('leak', leak);
        });

    }

    RED.nodes.registerType("leak",Leak);


    function HeapDump(n) {
        RED.nodes.createNode(this,n);
        const node = this;
        this.name = n.name;

        node.on("input", function(msg) {
            try {
                let filePath = userDir + "/" + process.pid + '-' + Date.now() + '.heapsnapshot';
                heapdump.writeSnapshot(filePath, (err) => {
                    if (err) {
                        node.error(err);
                    } else {
                        msg.payload = filePath
                        node.send(msg)
                    }
                });
            } catch (error) {
                msg.payload = error.message
                node.send(msg)
            }
        });

    }
    RED.nodes.registerType("heap-dump",HeapDump);


    function HeapDiff(n) {
        RED.nodes.createNode(this,n);
        const node = this;
        this.name = n.name;

        let hd = null;

        node.on("input", function(msg) {
            try {
                if (msg.payload == 'start') {
                    hd = new memwatch.HeapDiff();
                }else if(msg.payload == 'stop') {
                    if (!hd) {
                        node.error('请先发送 start 指令')
                        return
                    }

                    msg.payload = hd.end()
                    hd = null
                    node.send(msg)

                }
            } catch (error) {
                msg.payload = error.message
                node.send(msg)
            }
        });

    }
    RED.nodes.registerType("heap-diff",HeapDiff);

}