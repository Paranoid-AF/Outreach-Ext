This is a node implementation of Outreach-Ext, which is supposed to work with [Outreach](https://github.com/Paranoid-AF/Outreach), as a brdige to enable Sven Co-op plugins to access the outter resources.

You may need to refer to the original Outreach for concepts here.

## Usage
> Before everything we're going to do, you should have `Node.js` installed on your system.

Clone this repository, and install its dependencies:
```shell
npm install
```

Edit **/config/general.json**, fill in your `svencoop` directory path.

> If you're using Windows, please replace every backslash `\` with double backslash `\\` to avoid escaping.  
For instance, `C:\SCDS\svencoop` should be written as `C:\\SCDS\\svencoop`

After all of those, run:
```shell
node .
```

If you need verbose log messages (such as interception of dispatching), you may want to run:
```shell
node . -D
# OR
node . --dev
```

Now Outreach-Ext will be listening for actions that's declared in `/services`, calling those actions and returning results to Outreach in Sven Co-op when it should be doing so. And everything works like it's in Sven Co-op.

> You're supposed to run this **BEFORE** Sven Co-op Dedicated Server.

## Service
Again, you need to define services. [Read them here.](https://github.com/Paranoid-AF/Outreach-Ext/tree/master/services)

## Calling Actions
In order to call actions, you should use this project as a npm module.
### Installing this Module
Start another Node.js project, and install this module:
```
npm install [Outreach-Ext's Directory]
```
It's not recommended to use `yarn` here, as it would copy the whole Outreach-Ext directory to your project, instead of soft linking it - this is going to make updates and maintenance harder. However, there's always [a solution to make yarn soft link it.](https://github.com/Paranoid-AF/Outreach-Ext#YARN-solution)

### Importing It
When you need to call Outreach actions in your project, require this module with:
```javascript
const outreach = require('outreach')
```
Then dispatch an event to call an action:
```javascript
outreach["A Service Name Here"].dispatch(identifier: string, targetService: string, targetAction: string, payload: string)
```
Yes, you also need to dispatch as a service here. Replace `A Service Name Here` with your actual service name.  
`identifier` should be unique, just put a constant string here, and it could be whatever you like.  
`targetService` is the name of service which has the action that you wanted.  
`targetAction` is the target action's name.  
`payload` is the value that you wanted to pass to the action function.

Please note that `dispatch()` will return a **Promise**, rather than the results directly. Because you may not want your whole program blocked just for this one request.

When the action is successfully executed, the Promise will be resolved, and you will get an object:
```typescript
interface OutreachResult {
  uuid: string,       // The unique call ID used by Outreach internally, not really useful here.
  resolver: string,   // The service name where the called action is located. 
  action: string,     // Original action name that was called.
  time: string,       // Timestamp when the action function has finished execution.
  timeIssued: string, // Timestamp when the action was called.
  payload: string,    // The return value from the action function.
  ref: string         // The original payload when calling the action.
}
```
And... you could do whatever you want with it, just like what you would do in Outreach.

## Conclusion
Yes, I know the code looks bad, as I was trying to figure out if my design was really going to work... and it works. Maybe some time I would take time rewriting it.

Additionally, this project also has a TypeScript declaration file, which should come in handy when you're going full ahead with TypeScript.

Still, everything is experimental. This could be unstable anyway.

## YARN solution
It's possible to use `yarn` to soft link a package instead of copying everything for installation.

In `Outreach-Ext` directory, run:
```shell
yarn link
```
Now YARN would remember this link.

And in your project directory, run:
```shell
yarn link "outreach"
```
