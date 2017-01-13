
crypto = require 'crypto'
{exec, spawn} = require 'child_process'
fs = require 'fs'
path = require 'path'
exists = fs.exists or path.exists

md5 = (cmd) -> crypto.createHash('md5').update(cmd).digest('hex')

###
`start_stop`: Unix process management
-------------------------------------

The library start and stop unix child process. Process are by default 
daemonized and will keep running even if your current process exit. For 
conveniency, they may also be attached to the current process by 
providing the `attach` option.

###
module.exports = start_stop =

  ###

  `start(options, callback)`
  --------------------------
  Start a prcess as a daemon (default) or as a child of the current process. Options includes
  all the options of the "child_process.exec" function plus a few specific ones.

  `options`         , Object with the following properties:
  *   `cmd`         , Command to run
  *   `cwd`         , Current working directory of the child process
  *   `detached`    , Detached the child process from the current process
  *   `pidfile`     , Path to the file storing the child pid
  *   `stdout`      , Path to the file where standard output is redirected
  *   `stderr`      , Path to the file where standard error is redirected
  *   `strict`      , Send an error when a pid file exists and reference
                an unrunning pid.
  *   `watch`       , Watch for file changes
  *   `watchIgnore` , List of ignore files
  
  `callback`        , Received arguments are:
  *   `err`         , Error if any
  *   `pid`         , Process id of the new child

  ###
  start: (options, callback) ->
    if options.attach?
      console.log 'Option attach was renamed to attached to be consistent with the new spawn option'
      options.detached = not options.attach
    if options.detached
      child = null
      cmdStdout =
        if typeof options.stdout is 'string' 
        then options.stdout else '/dev/null'
      cmdStderr =
        if typeof options.stderr is 'string'
        then options.stderr else '/dev/null'
      check_pid = ->
        start_stop.pid options, (err, pid) ->
          return watch() unless pid
          start_stop.running pid, (err, pid) ->
            return callback new Error "Pid #{pid} already running" if pid
            # Pid file reference an unrunning process
            if options.strict
            then callback new Error "Pid file reference a dead process"
            else watch()
      watch = ->
        return start() unless options.watch
        options.watch = options.cwd or process.cwd unless typeof options.watch is 'string'
        ioptions =
          path: options.watch
          ignoreFiles: [".startstopignore"] or options.watchIgnoreFiles
        console.log 'ioptions', ioptions
        ignore = require 'fstream-ignore'
        ignore(ioptions)
        .on 'child', (c) ->
          # c.on 'ignoreFile', (path, content) ->
          #   console.log 'ignore', path, content.toString()
          fs.watchFile c.path, (curr, prev) ->
            console.log c.path 
            start_stop.stop options, (e) ->
              start_stop.start options, (e) ->
                console.log 'restarted', e
            # a file has changed, restart the child process
            # child.kill('SIGHUP')
            # child.on 'exit', (code, signal) ->
            #   console.log('child process terminated due to receipt of signal '+signal)
            #   start()
        # .on 'ignoreFile', (path, content) ->
        #   console.log 'ignore', path, content.toString()

        start()
      # Start the process
      start = ->
        pipe = "</dev/null >#{cmdStdout} 2>#{cmdStdout}"
        info = 'echo $? $!'
        cmd = "#{options.cmd} #{pipe} & #{info}"
        child = exec cmd, options, (err, stdout, stderr) ->
          [code, pid] = stdout.split(' ')
          code = parseInt code, 10
          pid = parseInt pid, 10
          if code isnt 0
            msg = "Process exit with code #{code}"
            return callback new Error msg
          exists path.dirname(options.pidfile), (exists) ->
            return callback new Error "Pid directory does not exist" unless exists
            fs.writeFile options.pidfile, '' + pid, (err) ->
              callback null, pid
      # Do the job
      check_pid()
    else # Kill child on exit if started in attached mode
      c = exec options.cmd
      if typeof options.stdout is 'string'
        stdout =  fs.createWriteStream options.stdout
      else if options.stdout isnt null and typeof options.stdout is 'object'
        stdout = options.stdout
      else
        stdout = null
      if typeof options.stderr is 'string'
        stdout =  fs.createWriteStream options.stderr
      else if options.stderr isnt null and typeof options.stderr is 'object'
        stderr = options.stderr
      else
        stderr = null
      process.nextTick ->
        # Block the command if not in shell and process is attached
        options.pid = c.pid
        callback null, c.pid
  
  ###

  `stop(options, callback)`
  -------------------------
  Stop a process. In daemon mode, the pid is obtained from the `pidfile` option which, if 
  not provided, can be guessed from the `cmd` option used to start the process.

  `options`         , Object with the following properties:
  *   `detached`    , Detach the child process to the current process
  *   `cmd`         , Command used to run the process, in case no pidfile is provided
  *   `pid`         , Pid to kill in attach mode
  *   `pidfile`     , Path to the file storing the child pid
  *   `strict`      , Send an error when a pid file exists and reference
                an unrunning pid.
  
  `callback`        , Received arguments are:
  *   `err`         , Error if any
  *   `stoped`      , True if the process was stoped

  ###
  stop: (options, callback) ->
    if options.attach?
      console.log 'Option attach was renamed to attached to be consistent with the new spawn option'
      options.detached = not options.attach
    # Stoping a provided PID
    if typeof options is 'string' or typeof options is 'number'
      options = {pid: parseInt(options, 10), detached: false}
    kill = (pid) ->
      # Not trully recursive, potential scripts:
      # http://machine-cycle.blogspot.com/2009/05/recursive-kill-kill-process-tree.html
      # http://unix.derkeiler.com/Newsgroups/comp.unix.shell/2004-05/1108.html
      cmds = """
      for i in `ps -ef | awk '$3 == '#{pid}' { print $2 }'`
      do
        kill $i
      done
      kill #{pid}
      """
      exec cmds, (err, stdout, stderr) ->
        return callback new Error "Unexpected exit code #{err.code}" if err
        options.pid = null
        callback null, true
    if options.detached
      start_stop.pid options, (err, pid) ->
        return callback err if err
        return callback null, false unless pid
        fs.unlink options.pidfile, (err) ->
          return callback err if err
          start_stop.running pid, (err, running) ->
            unless running
              return if options.strict
              then callback new Error "Pid file reference a dead process"
              else callback null, false
            kill pid
    else
      kill options.pid
  
  ###

  `pid(options, callback)`
  ------------------------
  Retrieve a process pid. The pid value is return only if the command is running 
  otherwise it is set to false.

  `options`       , Object with the following properties:
  *   `detached`  , True if the child process is not attached to the current process
  *   `cmd`       , Command used to run the process, in case no pidfile is provided
  *   `pid`       , Pid to kill if not running in detached mode
  *   `pidfile`   , Path to the file storing the child pid


  `callback`      , Received arguments are:
  *   `err`       , Error if any
  *   `pid`       , Process pid. Pid is null if there are no pid file or 
                    if the process isn't running.
  
  ###
  pid: (options, callback) ->
    if options.attach?
      console.log 'Option attach was renamed to attached to be consistent with the new spawn option'
      options.detached = not options.attach
    # Attach mode
    unless options.detached
      return new Error 'Expect a pid property in attached mode' unless options.pid?
      return callback null, options.pid
    # Deamon mode
    start_stop.file options, (err, file, exists) ->
      return callback null, false unless exists
      fs.readFile options.pidfile, 'ascii', (err, pid) ->
        return callback err if err
        pid = pid.trim()
        callback null, pid

  ###

  `file(options, callback)`
  -------------------------
  Retrieve information relative to the file storing the pid. Retrieve 
  the path to the file storing the pid number and whether 
  it exists or not. Note, it will additionnaly enrich the `options`
  argument with a pidfile property unless already present.

  `options`       , Object with the following properties:
  *   `detached`  , True if the child process is not attached to the current process
  *   `cmd`       , Command used to run the process, in case no pidfile is provided
  *   `pid`       , Pid to kill in attach mode
  *   `pidfile`   , Path to the file storing the child pid

  `callback`      , Received arguments are:
  *   `err`       , Error if any
  *   `path`      , Path to the file storing the pid, null in attach mode
  *   `exists`    , True if the file is created

  ###
  file: (options, callback) ->
    if options.attach?
      console.log 'Option attach was renamed to detached to be consistent with the spawn API'
      options.detached = not options.attach
    return callback null, null, false unless options.detached
    start = ->
      return pidFileExists() if options.pidfile
      dir = path.resolve process.env['HOME'], '.node_shell'
      file = md5 options.cmd
      options.pidfile = "#{dir}/#{file}.pid"
      exists dir, (dirExists) ->
        return createDir() unless dirExists
        pidFileExists()
    createDir = ->
      fs.mkdir dir, 0o0700, (err) ->
        return callback err if err
        pidFileExists()
    pidFileExists = ->
      exists options.pidfile, (pidFileExists) ->
        callback null, options.pidfile, pidFileExists
    start()
  
  ###

  `running(pid, callback)`
  ------------------------

  Test if a pid match a running process.

  `pid`           , Process id to test

  `callback`      , Received arguments are:
  *   `err`       , Error if any
  *   `running`   , True if pid match a running process

  ###
  running: (pid, callback) ->
    exec "ps -ef #{pid} | grep -v PID", (err, stdout, stderr) ->
      return callback err if err and err.code isnt 1
      callback null, not err


