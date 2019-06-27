# pushbear markdown 邮件模板

## 安装

```
$ npm i node-red-contrib-markdown-mail
```

## 测试流程

```json
[{"id":"10d2769d.7a77e9","type":"e-mail","z":"17e201be.442a8e","server":"smtp.qq.com","port":"465","secure":true,"name":"434715737@qq.com","dname":"","x":956,"y":930,"wires":[]},{"id":"702aa829.345428","type":"inject","z":"17e201be.442a8e","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":129,"y":954,"wires":[["d493b.d80bb6c5"]]},{"id":"d493b.d80bb6c5","type":"function","z":"17e201be.442a8e","name":"内容准备","func":"msg.payload = `\n门口监测到人走动，请看图核实身份   \n![图片](https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1557395612&di=be03f8779ccb85ac0fad4e77e066d97c&src=http://s11.sinaimg.cn/mw690/006hikKrzy7slvzPwSKba&690)\n\n\n`\nmsg.title = \"测试发送数据\"\nreturn msg;","outputs":1,"noerr":0,"x":338,"y":957,"wires":[["3b0c8997.0e2af6"]]},{"id":"3b0c8997.0e2af6","type":"markdown-mail","z":"17e201be.442a8e","name":"","title":"","content":"","x":626,"y":947,"wires":[["10d2769d.7a77e9"]]}]
```

## Maintainers

[@yaming116](https://github.com/yaming116)

## License

MIT © 2018 yaming116

