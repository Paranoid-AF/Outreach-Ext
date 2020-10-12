const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')

const serializer = require('./utils/serializer')
const logger = require('./utils/consoleLogger')
const idGen = require('./utils/idGenerate')

const version = require('./package.json').version
const config = require('./config/general.json')
const configDispatch = require('./config/dispatch.json')

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

if(module === require.main){
  fs.unlinkSync(path.resolve(configPaths.mainStore, `./services.list`))
}
fs.readdirSync(path.resolve(__dirname, './services')).forEach(file => {
  if(file.endsWith('.js')){
    const currentService = require(path.resolve(__dirname, `./services/${file}`))
    services.push(currentService)
    fs.writeFile(path.resolve(configPaths.mainStore, `./services.list`), currentService['name'] + '\n', { encoding: 'utf8', flag: 'a'}, () => {})
  }
})

if(services.length > 0){
  if(module === require.main){
    logger.info(`Loaded ${services.length} service(s).`, true)
  }
}else{
  logger.err(`No service found! Check services/README.txt`, true)
}

/* Run as a module */
if(module !== require.main){
  const exported = {}
  const dispatchResults = {}
  let watcher = null
  let waitingRequest = 0
  services.forEach(val => {
    exported[val.name] = val
    const serviceName = val.name
    delete val.name
    val["requestCounter"] = 0
    val["dispatch"] = async (identifier, targetService, targetAction, payload) => {
      return dispatchHandler(identifier, targetService, targetAction, payload, serviceName, val)
    }
  })

  async function dispatchHandler(identifier, targetService, targetAction, payload, serviceName, val){
    const task = {
      uuid: idGen.uuid(identifier+'+'+serviceName, targetService, val["requestCounter"]),
      issuer: serviceName,
      action: targetAction,
      time: Math.round((new Date()).getTime() / 1000).toString(),
      payload: payload
    }
    val["requestCounter"]++
    const resultSerialized = serializer.serialize(task)
    startWatching()
    waitingRequest++
    fs.writeFile(path.resolve(configPaths.serviceStore, `./${targetService}.task`), resultSerialized + '\n', { encoding: 'utf8', flag: 'a'}, () => {})
    return new Promise((resolve, reject) => {
      const detectionInterval = configDispatch.detectionInterval
      const timeoutTime = configDispatch.timeOutTime
      let timeUsed = 0
      const detection = setInterval(() => {
        if(task.uuid in dispatchResults){
          const result = dispatchResults[task.uuid]
          delete dispatchResults[task.uuid]
          resolve(result)
          waitingRequest--
          clearInterval(detection)
          recycleWatcher()
        }
        timeUsed += detectionInterval
        if(timeUsed > timeoutTime){
          reject(`Timed out: ${task.uuid}`)
          waitingRequest--
          if(task.uuid in dispatchResults){
            delete dispatchResults[task.uuid]
          }
          clearInterval(detection)
          recycleWatcher()
        }
      }, detectionInterval)
    })
  }

  function recycleWatcher(){
    if(waitingRequest <= 0 && watcher !== null){
      watcher.close()
      watcher = null
    }
  }
  function startWatching(){
    if(waitingRequest <= 0){
      watcher = chokidar.watch(configPaths.serviceStore)
      watcher.on('change', (filepath) => {
        const file = path.basename(filepath)
        const serviceName = file.substring(0, file.length - 5)
        const changeType = file.substring(file.length - 4, file.length)
        const targetService = exported[serviceName]
        if(changeType === "rslt"){
          if(typeof targetService === 'object'){
            fs.readFile(path.resolve(filepath), { encoding: 'utf8' }, (err, data) => {
              if(!err && data !== ''){
                fs.writeFileSync(filepath, '', { encoding: 'utf8'})
                transmitResult(data)
              }
            })
          }
        }
      })
    }
  }
  function transmitResult(data){
    data.split('\n').forEach(val => {
      if(val !== ''){
        const info = serializer.deserialize(val)
        dispatchResults[info.uuid] = info
      }
    })
  }
  module.exports = exported
  return
}

/* Run as a server */
console.info(`Everything is ready, listening at \x1b[4m${config.path}\x1b[0m`)
const watcher = chokidar.watch(configPaths.serviceStore)
watcher.on('change', (filepath) => {
  const file = path.basename(filepath)
  const serviceName = file.substring(0, file.length - 5)
  const changeType = file.substring(file.length - 4, file.length) // rslt or task
  const targetService = services.find(val => val.name === serviceName)
  if(changeType === "task"){
    if(typeof targetService === 'object'){
      fs.readFile(path.resolve(filepath), { encoding: 'utf8' }, (err, data) => {
        if(!err && data !== ''){
          fs.writeFileSync(filepath, '', { encoding: 'utf8'})
          data.split('\n').forEach(val => {
            if(val !== ''){
              const info = serializer.deserialize(val)
              const method = targetService.actions[info.action]
              if(typeof method === "function"){
                Promise.resolve(method(info))
                  .then(actionPayload => {
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
                  })
                  .catch(err => {
                    logger.err(`Action ${info.action} has reported an error. ${err}`, true)
                  })
              }else{
                logger.err(`Received action ${info.action} which should be handled by ${serviceName}, but it doesn't appear to have a proper function to handle it.`)
              }
            }
          })
        }
      })
    }
  }
})
