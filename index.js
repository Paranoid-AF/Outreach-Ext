const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')

const serializer = require('./utils/serializer')

const config = require('./config/config.json')

const configPaths = {
  storePath: path.resolve(config.path, './scripts/plugins/store/'),
  mainStore: path.resolve(config.path, './scripts/plugins/store/Outreach'),
  serviceStore: path.resolve(config.path, './scripts/plugins/store/Outreach-Services')
}

const services = [];

if(!fs.existsSync(configPaths.mainStore)){
  fs.mkdirSync(configPaths.mainStore)
}

if(!fs.existsSync(configPaths.serviceStore)){
  fs.mkdirSync(configPaths.serviceStore)
}

fs.readdirSync(path.resolve(__dirname, './services')).forEach(file => {
  if(file.endsWith('.js')){
    services.push(require(path.resolve(__dirname, `./services/${file}`)))
  }
})

chokidar.watch(configPaths.serviceStore).on('change', (filepath) => {
  const file = path.basename(filepath)
  const serviceName = file.substring(0, file.length - 5)
  const changeType = file.substring(file.length - 4, file.length) // rslt or task
  const targetService = services.find(val => val.name === serviceName)
  if(targetService !== undefined){
    fs.readFile(path.resolve(filepath), { encoding: 'utf8' }, (err, data) => {
      if(!err && data !== ''){
          fs.writeFile(filepath, '', { encoding: 'utf8'}, () => {})
          if(changeType === "rslt"){
            data.split('\n').forEach(val => {
              if(val !== ''){
                const info = serializer.deserialize(val)
                console.log(info)
              }
            })
          }
          if(changeType === "task"){
            data.split('\n').forEach(val => {
              if(val !== ''){
                const info = serializer.deserialize(val)
                console.log(info)
              }
            })
          }
      }
    })
  }
})
