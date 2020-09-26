const hexMap = {
  uuid: "\x01",
  issuer: "\x02",
  resolver: "\x03",
  action: "\x04",
  payload: "\x05",
  time: "\x06",
  timeIssued: "\x07",
  ref: "\x08"
}
const hexReversed = { }
let regexReplace = ""
Object.keys(hexMap).forEach((val, index) => {
  hexReversed[hexMap[val]] = val
  regexReplace += hexMap[val]
})
const replaceHex = new RegExp("[" + regexReplace + "]", 'g')

function serialize(obj){
  let result = ""
  Object.keys(obj).forEach((val, index) => {
    let str = ""
    if(typeof obj[val] === "string"){
      str = obj[val]
    }else{
      str = obj[val].toString()
    }
    result += str.replace(replaceHex, '') + hexMap[val]
  })
  return result
}

function deserialize(str){
  let result = { }
  let seg = ""
  for(let i=0; i<str.length; i++){
    const posChar = str.charAt(i)
    if(hexReversed[posChar] !== undefined){
      result[hexReversed[posChar]] = seg
      seg = ""
    }else{
      seg += posChar
    }
  }
  return result
}

module.exports = {
  serialize: serialize,
  deserialize: deserialize
}