
fs = require 'fs'
path = require 'path'
existsSync = fs.existsSync or path.existsSync
start_stop = require '../start_stop'
###

HTTP server
===========

Register two commands, `http start` and `http stop`. The start command will 
search for "./server.js" and "./app.js" (and additionnaly their CoffeeScript 
alternatives) to run by `node`.

The following properties may be provided as settings:

-   `message_start` Message to display once the server is started
-   `message_stop`  Message to display once the server is stoped
-   `workspace`     Project directory used to resolve relative paths and search for "server" and "app" scripts.
-   `cmd`           Command to start the server, not required if path is provided or if the script is discoverable
-   `path`          Path to the js/coffee script starting the process, may be relative to the workspace, extension isn't required.

Properties derived from the start_stop utility:   

-   `detached`      Wether the HTTP process should be attached to the current process. If not defined, default to `false` (the server doesn't run as a daemon).
-   `pidfile`       Path to the file storing the daemon process id. Defaults to `"/.node_shell/#{md5}.pid"`
-   `stdout`        Writable stream or file path to redirect the server stdout.
-   `stderr`        Writable stream or file path to redirect the server stderr.

Example:

```javascript
var app = new shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.http({
    shell: app
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
  cmd = () ->
    searchs = if settings.path then [settings.path] else ['app', 'server', 'lib/app', 'lib/server']
    for search in searchs
      search = path.resolve settings.workspace, search
      if existsSync "#{search}"
        if search.substr(-4) is '.coffee'
        then return "coffee #{search}"
        else return "node #{search}"
      if existsSync "#{search}.js"
        return "node #{search}.js"
      else if existsSync "#{search}.coffee"
        return "coffee #{search}.coffee"
    throw new Error 'Failed to discover a "server.js" or "app.js" file'
  http = null
  # Register commands
  route = (req, res, next) ->
    app = req.shell
    # Caching
    return next() if app.tmp.http
    app.tmp.http = true
    # Workspace settings
    settings.workspace ?= app.set 'workspace'
    throw new Error 'No workspace provided' if not settings.workspace
    # Messages
    settings.message_start ?= 'HTTP server successfully started'
    settings.message_stop ?= 'HTTP server successfully stopped'
    settings.cmd = cmd() unless settings.cmd
    app.cmd 'http start', 'Start HTTP server', (req, res, next) ->
      http = start_stop.start settings, (err, pid) ->
        return next err if err
        return res.cyan('HTTP server already started').ln() and res.prompt() unless pid
        res.cyan(settings.message_start).ln()
        res.prompt()
    app.cmd 'http stop', 'Stop HTTP server', (req, res, next) ->
      start_stop.stop settings, (err, success) ->
        if success
        then res.cyan(settings.message_stop).ln()
        else res.magenta('HTTP server was not started').ln()
        res.prompt()
    next()
  if arguments.length is 1
    settings = arguments[0]
    return route
  else
    route.apply null, arguments
