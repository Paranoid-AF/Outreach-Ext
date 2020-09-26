const axios = require('axios')
module.exports = {
  name: "quantum",
  actions: {
    setname: async (data) => {
      const res = (await axios(`http://localhost:8080/setname?name=${data.payload}`)).data
      return res
    },
    play_with_me: async (data) => {
      console.log(data.payload)
      return "world.execute(me);"
    }
  },
}