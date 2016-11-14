
###

Confirm route
=============

The `confirm` route ask the user if he want to continue the process. If the answer is `true`, the following routes are executed. Otherwise, the process is stoped.

```javascript
var app = new shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
});
app.cmd('install', [
  shell.routes.confirm('Do you confirm?'),
  my_app.routes.download,
  my_app.routes.configure
]);
```

###
module.exports = (message) ->
  (req, res, next) ->
    req.confirm message, true, (confirmed) ->
      return res.prompt() unless confirmed
      next()
