
path = require 'path'
start_stop = require '../start_stop'

# Sanitize a list of files separated by spaces
enrichFiles = (files) ->
  return files.split(' ').map( (file) ->
    path.normalize file
    # Stylus doesn't like trailing `/` in the use option
    if file.substr(-1, 1) is '/'
      file = file.substr 0, file.length - 1
    file
  ).join ' '

###

Stylus plugin
-------------
Start/stop a daemon to watch and convert stylus files to css.   

Options include:   
*   `output`  Output to <dir> when passing files.
*   `input`   Add <path> to lookup paths

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
    # Watch the modification times of the coffee-scripts,
    # recompiling as soon as a change occurs.
    args.push '-w'
    if settings.use
      args.push '-u'
      args.push enrichFiles(settings.use)
    if settings.output
      args.push '-o'
      args.push enrichFiles(settings.output)
    if not settings.input
      settings.input = settings.workspace
    if settings.input
      args.push enrichFiles(settings.input)
    cmd = 'stylus ' + args.join(' ')
  settings.cmd = cmd()
  #console.log settings.cmd
  # Register commands
  shell.cmd 'stylus start', 'Start CoffeeScript', (req, res, next) ->
    start_stop.start settings, (err, pid) ->
      return next err if err
      return res.cyan('Already Started').ln() unless pid
      message = "Stylus started"
      res.cyan( message ).ln()
      res.prompt()
  shell.cmd 'stylus stop', 'Stop Stylus', (req, res, next) ->
    start_stop.stop settings, (err, success) ->
      if success
      then res.cyan('Stylus successfully stoped').ln()
      else res.magenta('Stylus was not started').ln()
      res.prompt()

