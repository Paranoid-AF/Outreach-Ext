module.exports = {
  name: "redis",
  actions: {
    query: async (data) => {

    },
    play_with_me: async (data) => {
      console.log(data.payload)
      return "world.execute(me);"
    }
  },
}