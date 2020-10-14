## Service
Create a `.js` file here, as it should be a node module. However the name doesn't matter here.

Then write it normally, until exporting your module.

You should be exporting an object, with the following structure.

```javascript
module.exports = {
  name: "myUtils", // Name of this service
  actions: {
    setname: (data) => { // An action called setname, with a sync function.
      console.log("You can't set name here!")
      return "Permission denied."
    },
    getServerMessage: async (data) => { // An action called getServerMessage, with an async function
      const msg = (await axios('http://localhost:3000/api/game/message?value='+data.payload)).data
      return msg
    }
  },
}
```

The object should have a property called `name`, declaring the service's name.

Then we have another property called `action`, with a value of object, containing action functions. Action functions could be normal functions, and could also be async functions.

Those action functions should have an argument, which will be passed an object:
```typescript
interface OutreachTask {
  uuid: string,   // The unique call ID used by Outreach internally, not really useful here.
  issuer: string, // The name of the service which called this action.
  action: string, // Current action's name.
  time: string,   // Timestamp when current action is actually called.
  payload: string // Value passed to call this action.
}
```

You could declare multiple actions within one service.