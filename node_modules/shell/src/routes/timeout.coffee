
###

Timeout route
=============

The `timeout` route will wait for the provided period (in millisenconds) before executing the following route.

```javascript
var app = new shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
});
app.cmd('restart', [
  my_app.routes.stop,
  shell.routes.timeout(1000),
  my_app.routes.start
]);
```

###
module.exports = (timeout) ->
  (req, res, next) ->
    setTimeout timeout, next
