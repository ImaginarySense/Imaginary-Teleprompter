
start_stop = require '../start_stop'

###
Redis Plugin
============

Register two commands, `redis start` and `redis stop`. The following properties may be provided as settings:

-   `config`   , Path to the configuration file. Required to launch redis.
-   `detached` , Wether the Redis process should be attached to the current process. If not defined, default to `false` (the server doesn't run as a daemon).
-   `pidfile`  , Path to the file storing the daemon process id. Defaults to `"/.node_shell/#{md5}.pid"`
-   `stdout`   , Writable stream or file path to redirect cloud9 stdout.
-   `stderr`   , Writable stream or file path to redirect cloud9 stderr.

Example:
  
```javascript
var app = shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.redis({
    shell: app,
    config: __dirname+'/redis.conf')
  }));
  app.use(shell.help({
    shell: app,
    introduction: true
  }));
});
```
###
module.exports = () ->
  settings = {}
  # Register commands
  redis = null
  route = (req, res, next) ->
    app = req.shell
    # Caching
    return next() if app.tmp.redis
    app.tmp.redis = true
    # Default settings
    settings.workspace ?= app.set 'workspace'
    settings.config ?= ''
    settings.cmd = "redis-server #{settings.config}"
    app.cmd 'redis start', 'Start Redis', (req, res, next) ->
      # Launch process
      redis = start_stop.start settings, (err, pid) ->
        return next err if err
        unless pid
          res.cyan('Redis already started').ln()
          return res.prompt() 
        res.cyan('Redis started').ln()
        res.prompt()
    app.cmd 'redis stop', 'Stop Redis', (req, res, next) ->
      start_stop.stop settings, (err, success) ->
        if success
        then res.cyan('Redis successfully stoped').ln()
        else res.magenta('Redis was not started').ln()
        res.prompt()
    next()
  if arguments.length is 1
    settings = arguments[0]
    return route
  else
    route.apply null, arguments
