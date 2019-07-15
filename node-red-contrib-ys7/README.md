# 萤石指纹锁开门记录




* 流程

``` json
[{"id":"846abe1a.16855","type":"debug","z":"d7878f8a.ae593","name":"成功","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":530,"y":833,"wires":[]},{"id":"13e5ae55.10d952","type":"ezviz-ys7","z":"d7878f8a.ae593","name":"xxxx","ezviz":"","deviceSerial":"","x":315,"y":884,"wires":[["846abe1a.16855"],["d3d8ef2b.ef0b6"]]},{"id":"1234c4dc.f7b5ab","type":"inject","z":"d7878f8a.ae593","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":137,"y":895,"wires":[["13e5ae55.10d952"]]},{"id":"d3d8ef2b.ef0b6","type":"debug","z":"d7878f8a.ae593","name":"失败","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","x":594,"y":912,"wires":[]}]
```