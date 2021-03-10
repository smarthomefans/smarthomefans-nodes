
// mock app device id
const APP_DEVICE_ID = '3C861A5820190429'
const SDK_VER = '3.4.1'
const APP_VER = '2.0.10'

const APP_UA = 'APP/com.xiaomi.mico APPV/2.1.17 iosPassportSDK/3.4.1 iOS/13.3.1'
const MINA_UA =
  'MiHome/6.0.103 (com.xiaomi.mihome; build:6.0.103.1; iOS 14.4.0) Alamofire/6.0.103 MICO/iOSApp/appStore/6.0.103'


const API = {
  USBS: 'https://api2.mina.mi.com/remote/ubus',
  SERVICE_AUTH: 'https://account.xiaomi.com/pass/serviceLoginAuth2',
  SERVICE_LOGIN: 'https://account.xiaomi.com/pass/serviceLogin',
  DEVICE_LIST: 'https://api2.mina.mi.com/admin/v2/device_list',
  DEVICE_MI: 'https://i.mi.com/find/device'
}

module.exports = {
  API,
  APP_UA,
  MINA_UA,
  APP_VER,
  SDK_VER,
  APP_DEVICE_ID
}
