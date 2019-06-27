module.exports = function(RED) {
    var mustache = require("mustache");
    var marked = require('marked')

    function markdownMailNode(config) {
        RED.nodes.createNode(this,config);
      
        var node = this;
        

        node.on('input', function(msg) {
            let title = config.title || msg.title || msg.topic ;

            let nodeData = config.content;
            let isTemplatedData = (nodeData||"").indexOf("{{") != -1;

            let data = nodeData || msg.payload;
            if (msg.payload && nodeData && (nodeData !== msg.payload)) { 
                node.warn(RED._("common.errors.nooverride"));
            }

            if (isTemplatedData) {
                data = mustache.render(nodeData,msg);
            }

            if (!data) {
                node.error(RED._("没有需要格式化的数据"),msg);
                return;
            }

            let content = parse(marked(data))

            msg.title = title;
            msg.payload = content;
            node.send(msg)
          
        });

        function parse(data){
            return `<!DOCTYPE html>
            <html lang="zh-cn">
            
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="x-ua-compatible" content="ie=edge">
                <title>消息阅读 | PushBear</title>
            </head>
            
            <body style='font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;line-height: 1.42857143; color: #333;'>
                <!-- Begin page content -->
                <div style="width: auto;max-width: 680px;padding: 0 15px;box-sizing: border-box;margin-right: auto;margin-left: auto;">
                    <div style='font-size: 18px;color: #444443;margin-left: -15px;'>
                        <p>${data}</p>
                    </div>
                </div>
                <footer style="position: absolute;bottom: 0;width: 100%;background-color: #f5f5f5;margin-left: -15px;">
                    <div
                        style="width: auto;max-width: 680px;padding: 0 15px;box-sizing: border-box;margin-right: auto;margin-left: auto;">
                        <p
                            style="color: #777; padding:0 5px 5px 0;margin-block-start: 1em;margin-block-end: 1em; margin-inline-start: 0px;margin-inline-end: 0px;">
                            本模板由 <a style="color: #428bca;text-decoration: none;background: 0 0;"
                                href="https://github.com/smarthomefans">SmartHomeFans</a>提供，<a
                                href="https://bbs.iobroker.cn"
                                style="color: #428bca;text-decoration: none;background: 0 0;">和大神一起完智能家居</a></p>
                    </div>
                </footer>
            
            </body>
            
            </html>`
        }

    }
    RED.nodes.registerType("markdown-mail", markdownMailNode);
    
}