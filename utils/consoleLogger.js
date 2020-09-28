const process = require('process')
const devMode = !!process.argv.find(val => (val === "--dev" || val === "-D"))
function writeLog(data, force = false, type = "info"){
  if(force || devMode){
    if(type === "norm"){
      console.log(data)
    }
    if(type === "info"){
      console.info("[\x1b[34mi\x1b[0m] %s", data)
    }
    if(type === "warn"){
      console.warn("[\x1b[33m!\x1b[0m] %s", data)
    }
    if(type === "err"){
      console.error("[\x1b[31mx\x1b[0m] %s", data)
    }
  }
}

module.exports = {
  devMode: devMode,
  norm: (data, force) => { writeLog(data, force, "norm") },
  normal: (data, force) => { writeLog(data, force, "norm") },
  info: (data, force) => { writeLog(data, force, "info") },
  warn: (data, force) => { writeLog(data, force, "warn") },
  warning: (data, force) => { writeLog(data, force, "warn") },
  err: (data, force) => { writeLog(data, force, "err") },
  error: (data, force) => { writeLog(data, force, "err") },
}