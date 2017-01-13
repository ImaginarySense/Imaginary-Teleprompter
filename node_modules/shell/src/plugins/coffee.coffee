
fs = require 'fs'
start_stop = require '../start_stop'

# Sanitize a list of files separated by spaces
enrichFiles = (files) ->
  return files.split(' ').map( (file) ->
    if file.substr(0, 1) isnt '/'
      file = '/' + file
    if file.substr(-1, 1) isnt '/' and fs.statSync(file).isDirectory()
      file += '/'
    file
  ).join ' '

###

CoffeeScript plugin
===================

Start Coffee in `--watch` mode, so scripts are instantly compiled into Javascript.

Options:

-   `src`      , Directory where ".coffee" are stored. Each ".coffee" script will be compiled into a .js JavaScript file of the same name.
-   `join`     , Before compiling, concatenate all scripts together in the order they were passed, and write them into the specified file. Useful for building large projects.
-   `output`   , Directory where compiled JavaScript files are written. Used in conjunction with "compile".
-   `lint`     , If the `jsl` (JavaScript Lint) command is installed, use it to check the compilation of a CoffeeScript file.
-   `require`  , Load a library before compiling or executing your script. Can be used to hook in to the compiler (to add Growl notifications, for example).
-   `detached` , Wether the Coffee process should be attached to the current process. If not defined, default to `false` (the server doesn't run as a daemon).
-   `pidfile`  , Path to the file storing the daemon process id. Defaults to `"/.node_shell/#{md5}.pid"`
-   `stdout`   , Writable stream or file path to redirect cloud9 stdout.
-   `stderr`   , Writable stream or file path to redirect cloud9 stderr.
-   `workspace`, Project directory used to resolve relative paths.

Example:

```javascript
var app = new shell();
app.configure(function() {
  app.use(shell.router({
    shell: app
  }));
  app.use(shell.coffee({
    shell: app
  }));
  app.use(shell.help({
    shell: app,
    introduction: true
  }));
});
```

###
module.exports = (settings = {}) ->
  # Validation
  throw new Error 'No shell provided' if not settings.shell
  shell = settings.shell
  # Default settings
  settings.workspace ?= shell.set 'workspace'
  throw new Error 'No workspace provided' if not settings.workspace
  cmd = () ->
    args = []
    # 
    if settings.join
      args.push '-j'
      args.push enrichFiles(settings.join)
    # Watch the modification times of the coffee-scripts,
    # recompiling as soon as a change occurs.
    args.push '-w'
    if settings.lint
      args.push '-l'
    if settings.require
      args.push '-r'
      args.push settings.require
    # Compile the JavaScript without the top-level function
    # safety wrapper. (Used for CoffeeScript as a Node.js module.)
    args.push '-b'
    if settings.output
      args.push '-o'
      args.push enrichFiles(settings.output)
    if not settings.compile
      settings.compile = settings.workspace
    if settings.compile
      args.push '-c'
      args.push enrichFiles(settings.compile)
    cmd = 'coffee ' + args.join(' ')
  settings.cmd = cmd()
  # Register commands
  shell.cmd 'coffee start', 'Start CoffeeScript', (req, res, next) ->
    start_stop.start settings, (err, pid) ->
      return next err if err
      return res.cyan('Already Started').ln() unless pid
      message = "CoffeeScript started"
      res.cyan( message ).ln()
      res.prompt()
  shell.cmd 'coffee stop', 'Stop CoffeeScript', (req, res, next) ->
    start_stop.stop settings, (err, success) ->
      if success
      then res.cyan('CoffeeScript successfully stoped').ln()
      else res.magenta('CoffeeScript was not started').ln()
      res.prompt()

