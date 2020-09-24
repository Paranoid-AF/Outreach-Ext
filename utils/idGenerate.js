const { Buffer } = require('buffer')
function generateUuid(serviceName, targetService, requestCounter){
  const timeStamp = Math.round((new Date()).getTime() / 1000)
  const result = requestCounter.toString() + "-" + serviceName + "-" + targetService + "-" + timeStamp.toString()
  return Buffer.from(result).toString('base64')
}

module.exports = {
  uuid: generateUuid
}