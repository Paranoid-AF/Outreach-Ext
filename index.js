const path = require('path')
const fs = require('fs')
const config = require("./config/config.json")
const configPaths = {
  storePath: path.resolve(config.path, "./scripts/plugins/store/"),
  mainStore: path.resolve(config.path, "./scripts/plugins/store/Outreach"),
  serviceStore: path.resolve(config.path, "./scripts/plugins/store/Outreach-Services")
}

const services = [];

if(!fs.existsSync(configPaths.mainStore)){
  fs.mkdirSync(configPaths.mainStore)
}

if(!fs.existsSync(configPaths.serviceStore)){
  fs.mkdirSync(configPaths.serviceStore)
}

fs.readdirSync(path.resolve(__dirname, "./services")).forEach(file => {
  if(file.endsWith(".js")){
    services.push(require(path.resolve(__dirname, `./services/${file}`)))
  }
})

