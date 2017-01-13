
start_stop = require '../start_stop'

###

Cloud9 plugin
=============

Register two commands, `cloud9 start` and `cloud9 stop`. Unless provided, 
the Cloud9 workspace will be automatically discovered if your project root 
directory contains a "package.json" file or a "node_module" directory.

Options:

-   `config`   , Load the configuration from a config file. Overrides command-line options. Defaults to `null`.
-   `group`    , Run child processes with a specific group.
-   `user`     , Run child processes as a specific user.
-   `action`   , Define an action to execute after the Cloud9 server is started. Defaults to `null`.
-   `ip`       , IP address where Cloud9 will serve from. Defaults to `"127.0.0.1"`.
-   `port`     , Port number where Cloud9 will serve from. Defaults to `3000`.
-   `workspace`, Path to the workspace that will be loaded in Cloud9, Defaults to `Shell.set('workspace')`.
-   `detached` , Wether the Cloud9 process should be attached to the current process. If not defined, default to `false` (the server doesn't run as a daemon).
-   `pidfile`  , Path to the file storing the daemon process id. Defaults to `"/.node_shell/#{md5}.pid"`
-   `stdout`   , Writable stream or file path to redirect cloud9 stdout.
-   `stderr`   , Writable stream or file path to redirect cloud9 stderr.

Example:

```javascript
var app = new shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.cloud9({
    shell: app,
    ip: '0.0.0.0'
  }));
  app.use(shell.help({
    shell: app,
    introduction: true
  }));
});
```

**Important:** If you encounter issue while installing cloud9, it might be because the npm module expect an older version of Node. 

Here's the procedure to use the latest version:

```
git clone https://github.com/ajaxorg/cloud9.git
cd cloud9
git submodule update --init --recursive
npm link
```

###
module.exports = (settings = {}) ->
  cmd = () ->
    args = []
    args.push '-w'
    args.push settings.workspace
    # Arguments
    if settings.config
      args.push '-c'
      args.push settings.config
    if settings.group
      args.push '-g'
      args.push settings.group
    if settings.user
      args.push '-u'
      args.push settings.user
    if settings.action
      args.push '-a'
      args.push settings.action
    if settings.ip
      args.push '-l'
      args.push settings.ip
    if settings.port
      args.push '-p'
      args.push settings.port
    "cloud9 #{args.join(' ')}"
  (req, res, next) ->
    app = req.shell
    # Caching
    return next() if app.tmp.cloud9
    app.tmp.cloud9 = true
    # Workspace
    settings.workspace ?= app.set 'workspace'
    return next(new Error 'No workspace provided') unless settings.workspace
    settings.cmd = cmd()
    # Register commands
    app.cmd 'cloud9 start', 'Start Cloud9', (req, res, next) ->
      # Launch process
      start_stop.start settings, (err, pid) ->
        return next err if err
        unless pid
          res.cyan('Cloud9 already started').ln()
          return res.prompt() 
        ip = settings.ip or '127.0.0.1'
        port = settings.port or 3000
        message = "Cloud9 started http://#{ip}:#{port}"
        res.cyan( message ).ln()
        res.prompt()
    app.cmd 'cloud9 stop', 'Stop Cloud9', (req, res, next) ->
      start_stop.stop settings, (err, success) ->
        if success
        then res.cyan('Cloud9 successfully stoped').ln()
        else res.magenta('Cloud9 was not started').ln()
        res.prompt()
    next()

