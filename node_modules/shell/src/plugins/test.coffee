
fs = require 'fs'
path = require 'path'
existsSync = fs.existsSync or path.existsSync
exec = require('child_process').exec

module.exports = (settings) ->
  # Validation
  throw new Error 'No shell provided' if not settings.shell
  shell = settings.shell
  # Default settings
  settings.workspace ?= shell.set 'workspace'
  throw new Error 'No workspace provided' if not settings.workspace
  settings.glob ?= 'test/*.js'
  # Register commands
  shell.cmd 'test', 'Run all test', (req, res, next) ->
    run = (cmd) ->
      args = []
      args.push cmd
      if settings.coverage
        args.push '--cov'
      if settings.serial
        args.push '--serial'
      if settings.glob
        args.push settings.glob
      expresso = exec 'cd ' + settings.workspace + ' && ' + args.join(' ')
      expresso.stdout.on 'data', (data) ->
        res.cyan data
      expresso.stderr.on 'data', (data) ->
        res.magenta data
      expresso.on 'exit', (code) ->
        res.prompt()
    paths = [].concat module.paths, require.paths
    for p in paths
      if existsSync p + '/expresso/bin/expresso'
        return run p
    res.magenta('Expresso not found').ln()
    res.prompt()
  shell.cmd 'test :pattern', 'Run specific tests', (req, res, next) ->
    #todo
