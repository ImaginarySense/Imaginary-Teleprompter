
fs = require 'fs'
path = require 'path'
existsSync = fs.existsSync or path.existsSync

module.exports =
  flatten: (arr, ret) ->
    ret ?= []
    for i in [0 ... arr.length]
      if Array.isArray arr[i]
        @flatten arr[i], ret
      else
        ret.push arr[i]
    ret
  # Discovery the project root directory or return null if undiscoverable
  workspace: () ->
    #dirs = require('module')._nodeModulePaths process.cwd()
    dirs = require('module')._nodeModulePaths process.argv[1]
    for dir in dirs
      if existsSync(dir) || existsSync(path.normalize(dir + '/../package.json'))
        return path.normalize dir + '/..'
  checkPort: (port, host, callback) ->
    cmd = exec "nc #{host} #{port} < /dev/null"
    cmd.on 'exit', (code) ->
      return callback true if code is 0
      return callback false if code is 1
      return callback new Error 'The nc (or netcat) utility is required'