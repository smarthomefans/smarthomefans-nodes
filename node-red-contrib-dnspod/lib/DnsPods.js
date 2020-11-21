const axios = require('axios');
const qs = require('qs')

const projectConfig = {
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    transformRequest: [
        data => qsString(data)
    ],
    paramsSerializer: params => qsString(params),
}
const qsString = obj => qs.stringify(obj)

class DnsPodsClass {

    constructor(node, config) {
        this.node = node
        this.config = config

    }

    init() {

        const { dnspod_id, token } = this.config

        if (!dnspod_id || !token) {
            throw new Error(`没有配置正确的dnspod server`)
        }
    }

    update(params) {
        return new Promise(async (resolve, reject) => {
            try {
                const { domain, myip, real_ip } = params

                var tempList = domain.split(".");
        
                if (tempList.length <= 1) {
                    node.warn({fill:"red", shape:"ring", text: `未知域名错误, 传入的域名为: ${domain}`});
                    throw new Error(`未知域名错误, 传入的域名为: ${domain}`)
                }
                this.init()

                const { dnspod_id, token } = this.config
                let mainDomain = tempList[tempList.length - 2] + "." + tempList[tempList.length - 1],
                subDomain = tempList.concat().slice(0, tempList.length - 2).join(".");


                let realIp;
                if (real_ip) {
                    realIp = real_ip;
                }else if (myip) {
                    realIp = await this.getIpByMyIp()
                } else {
                    realIp = await this.getIpByIP()
                }

                let login_token = `${dnspod_id},${token}`
                this.Record = {
                    "login_token": login_token,
                    'format': 'json',
                    'sub_domain': subDomain,
                    'domain': mainDomain
                }

                const {ip, recordId} =  await this.getDomainIp()

                if (realIp == ip) {
                    throw new Error("ip 没有发生变化")
                }


                this. updateParam = {
                    record_id: recordId,
                    sub_domain: subDomain,
                    domain: mainDomain,
                    "login_token": login_token,
                    'format': 'json',
                    record_type: 'A',
                    record_line: '默认',
                    mx: 1,
                    value: realIp
                }

                const updateData = await this.updateDomainIp()

                resolve(updateData)

            } catch (error) {
                reject(error)
            }
        })


    }

    getIpByIP() {
        return new Promise(async (resolve, reject) => {
            try {

                const { status, data } = await axios.get(`https://ip.cn/api/index?ip=&type=0`, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).catch(err => {
                    throw new Error(`[MyIp]${err}`)
                })

                if (status != 200) {
                    throw new Error(`[MyIp] 获取 ip 失败`)
                }
                
                resolve(data.ip)

            } catch (error) {
                reject(error)
            }
        })
    }


    getIpByMyIp() {
        return new Promise(async (resolve, reject) => {
            try {

                const { status, data } = await axios.get(`https://api.myip.com/`, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).catch(err => {
                    throw new Error(`[ip.cn]${err}`)
                })

                if (status != 200) {
                    throw new Error(`[ip.cn] 获取 ip 失败`)
                }
                resolve(data.ip)

            } catch (error) {
                reject(error)
            }
        })

    }

    getDomainIp() {
        return new Promise(async (resolve, reject) => {
            try {

                const { status, data } = await axios.post('https://dnsapi.cn/Record.List', this.Record, projectConfig)
                .catch(err => {
                    throw new Error(`[ip.cn]${err}`)
                })

                if (status != 200) {
                    throw new Error(`[dnspod] 获取 dns 记录 失败, ${err}`)
                }
                
                
                if (1 != data['status']['code']) {
                    this.node.warn(data)
                    throw new Error(`查询 dns Record List错误`)
                }

                if (!data['records'] || data['records'].length < 1) {
                    this.node.warn(data)
                    throw new Error(`查询 dns Record List错误`)
                }

                let ip = data['records'][0]['value']
                let recordId = data['records'][0]['id']
                

                resolve({ip, recordId})

            } catch (error) {
                reject(error)
            }
        })
    }


    updateDomainIp() {
        return new Promise(async (resolve, reject) => {
            try {

                
                const { status, data } = await axios.post('https://dnsapi.cn/Record.Modify',
                this.updateParam, projectConfig)
                .catch(err => {
                    throw new Error(`[updateDomainIp]${err}`)
                })

                if (status != 200) {
                    throw new Error(`[dnspod] 更新 dns 记录 失败, ${err}`)
                }
                
                resolve(data)

            } catch (error) {
                reject(error)
            }
        })
    }

}

module.exports = DnsPodsClass