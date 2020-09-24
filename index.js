const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const process = require('process')

const serializer = require('./utils/serializer')
const logger = require('./utils/consoleLogger')
const idGen = require('./utils/idGenerate')

const version = require('./package.json').version
const config = require('./config/config.json')

const configPaths = {
  storePath: path.resolve(config.path, './scripts/plugins/store/'),
  mainStore: path.resolve(config.path, './scripts/plugins/store/Outreach'),
  serviceStore: path.resolve(config.path, './scripts/plugins/store/Outreach-Services')
}

const services = [];

if(module === require.main){
  console.log(`\x1b[47m\x1b[30m%s\x1b[40m\x1b[37m %s \x1b[0m`, "Outreach-Ext", version)
  logger.norm(`Server starting up...`, true)
}

if(!fs.existsSync(configPaths.mainStore)){
  logger.warn(`Main folder not found, creating...`, true)
  fs.mkdirSync(configPaths.mainStore)
}

if(!fs.existsSync(configPaths.serviceStore)){
  logger.warn(`Service folder not found, creating...`, true)
  fs.mkdirSync(configPaths.serviceStore)
}

fs.readdirSync(path.resolve(__dirname, './services')).forEach(file => {
  if(file.endsWith('.js')){
    services.push(require(path.resolve(__dirname, `./services/${file}`)))
  }
})

if(services.length > 0){
  if(module === require.main){
    logger.info(`Loaded ${services.length} service(s).`, true)
  }
}else{
  logger.err(`No service found! Check services/README.txt`, true)
}

if(module !== require.main){
  const exported = {}
  services.forEach(val => {
    exported[val.name] = val
    val["requestCounter"] = 0
    val["dispatch"] = (targetService, targetAction, payload) => {
      const task = {
        uuid: idGen.uuid(val.name, targetService, val["requestCounter"]),
        issuer: val.name,
        action: targetAction,
        time: Math.round((new Date()).getTime() / 1000).toString(),
        payload: payload
      }
      delete val.name
      val["requestCounter"]++
      const requestSerial = serializer.serialize(task)
      return requestSerial // TODO
    }
  })
  module.exports = exported
  return
}

console.info(`Everything is ready, listening for \x1b[4m${config.path}\x1b[0m`)

chokidar.watch(configPaths.serviceStore).on('change', (filepath) => {
  const file = path.basename(filepath)
  const serviceName = file.substring(0, file.length - 5)
  const changeType = file.substring(file.length - 4, file.length) // rslt or task
  const targetService = services.find(val => val.name === serviceName)
  if(typeof targetService === 'object'){
    fs.readFile(path.resolve(filepath), { encoding: 'utf8' }, (err, data) => {
      if(!err && data !== ''){
        fs.writeFileSync(filepath, '', { encoding: 'utf8'})
        if(changeType === "task"){
          data.split('\n').forEach(val => {
            if(val !== ''){
              const info = serializer.deserialize(val)
              const method = targetService.actions[info.action]
              if(typeof method === "function"){
                const actionPayload = method(info)
                const result = {
                  uuid: info.uuid,
                  resolver: serviceName,
                  action: info.action,
                  time: Math.round((new Date()).getTime() / 1000).toString(),
                  timeIssued: info.time,
                  payload: actionPayload,
                  ref: info.payload,
                }
                const resultSerialized = serializer.serialize(result)
                if(logger.devMode){
                  console.info(`[\x1b[35m+\x1b[0m] \x1b[4m%s\x1b[0m%s\x1b[40m\x1b[37m%s\x1b[0m%s\x1b[1m%s\x1b[0m%s%s`, serviceName, `: Detected a `, info.action, ` request from `, info.issuer, `: `, info.payload)
                }
                fs.writeFile(path.resolve(configPaths.serviceStore, `./${info.issuer}.rslt`), resultSerialized + '\n', { encoding: 'utf8', flag: 'a'}, () => {})
              }
            }
          })
        }
      }
    })
  }
})
