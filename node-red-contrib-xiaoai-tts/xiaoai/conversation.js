const querystring = require('querystring')
const request = require('./request')
const { appendParam, randomString } = require('./utils')
const { API } = require('./const')

function conversation(operation, { cookie, deviceId }) {
  const param = {
    ...operation,
    timestamp: Date.now(),
    requestId: "app_ios_" + randomString(30),
  };
  const url = appendParam(
    `${API.USER_PROFILE}/device_profile/v2/conversation`,
    querystring.stringify(param)
  );


  return request({
    url,
    method: "GET",
    headers: {
      Cookie: `${cookie};deviceId=${deviceId}`,
    },
  });
}

module.exports = { conversation }
