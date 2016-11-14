
###

Prompt route
============

The `prompt` route is a convenient function to stop command once a few routes are executed. You can simply pass the the `shell.routes.prompt` function or call it with a message argument.

```javascript
var app = new shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
});
app.cmd('install', [
  my_app.routes.download,
  my_app.routes.configure,
  shell.routes.prompt('Installation is finished')
]);
```

###
module.exports = (req, res, next) ->
  if arguments.length is 1
    message = arguments[0]
    return (req, res, next) ->
      res.white message
      res.ln()
      res.prompt()
  else
    res.prompt()