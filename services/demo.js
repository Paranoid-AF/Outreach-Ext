module.exports = {
  name: "redis",
  actions: {
    query: (data) => {

    },
    play_with_me: (data) => {
      console.log(data.payload)
      return "world.execute(me);"
    }
  },
}