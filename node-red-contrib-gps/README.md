# node-red-contrib-gps

汽车在线和万物在线节点， 主要包含监控机车位置和地理位置逆解析


## 安装

**Requires Node.js v8.0 or newer**

Either install from the Node-RED palette manager, or:

```
$ npm i node-red-contrib-gps
```

## 使用

* **gpsoo-monitor** 用于获取设备信息，默认`msg.payload.data`是第一个设备信息，详细设备可以从`msg.payload.dataArray`获取
* **gpsoo-address** 通过经纬度反向获取地址信息，输入参数经纬度


## QQ群 776817275 欢迎大家加入

![](https://i.loli.net/2018/12/28/5c25b8bf1e78d.jpg)

## Maintainers

[@yaming116](https://github.com/yaming116)

## License

MIT © 2018 yaming116
