
fs = require 'fs'
path = require 'path'
exists = fs.exists or path.exists
should = require 'should'
start_stop = if process.env.SHELL_COV then require '../lib-cov/start_stop' else require '../lib/start_stop'

describe 'StartStop', ->
  it 'should detach a child, start and stop', (next) ->
    cmd = "node #{__dirname}/start_stop/server.js"
    # Start the process
    start_stop.start cmd: cmd, detached: true, (err, pid) ->
      should.not.exist err
      pid.should.be.a 'number'
      # Check if process started
      start_stop.running pid, (err, running) ->
        should.not.exist err
        running.should.be.true
        # Stop process
        start_stop.stop cmd: cmd, detached: true, (err) ->
          should.not.exist err
          # Check if process stoped
          start_stop.running pid, (err, running) ->
            should.not.exist err
            running.should.be.false
            next()
  it 'should detach a child and stop inactive process', (next) ->
    cmd = "node #{__dirname}/start_stop/server.js"
    # Stop process
    start_stop.stop cmd:cmd, detached: true, (err, stoped) ->
      should.not.exist err
      stoped.should.be.false
      next()
  it 'should detach a child and stop inactive process with pidfile', (next) ->
    cmd = "node #{__dirname}/start_stop/server.js"
    pidfile = "#{__dirname}/start_stop/pidfile"
    fs.writeFile pidfile, "1234567", (err) ->
      # Check process doesnt exists
      start_stop.running 1234567, (err, running) ->
        should.not.exist err
        running.should.be.false
        # Stop process
        start_stop.stop cmd:cmd, pidfile: pidfile, detached: true, (err, stoped) ->
          should.not.exist err
          stoped.should.be.false
          # Pidfile shall be removed even if pid is invalid
          exists pidfile, (running) ->
            running.should.be.false
            next()
  it 'should detach a child and honor the strict option', (next) ->
    # From the API
    # Send an error when a pid file exists and reference an unrunning pid.
    # Exist both in the start and stop functions
    # todo: test in start function
    cmd = "node #{__dirname}/start_stop/server.js"
    pidfile = "#{__dirname}/start_stop/pidfile"
    fs.writeFile pidfile, "1234567", (err) ->
      # Check process doesnt exists
      start_stop.running 1234567, (err, running) ->
        should.not.exist err
        running.should.be.false
        # Stop process
        start_stop.stop cmd:cmd, pidfile: pidfile, strict: true, detached: true, (err, stoped) ->
          err.should.be.an.instanceof Error
          # Pidfile shall be removed even if pid is invalid
          exists pidfile, (running) ->
            running.should.be.false
            next()
  it 'should detach a child and throw an error if pidfile not in directory', (next) ->
    cmd = "node #{__dirname}/start_stop/server.js"
    pidfile = "#{__dirname}/doesnotexist/pidfile"
    start_stop.start cmd:cmd, pidfile: pidfile, detached: true, (err, stoped) ->
      err.should.be.an.instanceof Error
      err.message.should.eql 'Pid directory does not exist'
      next()
  it 'should attach a child', (next) ->
    cmd = "node #{__dirname}/start_stop/server.js"
    # Start the process
    start_stop.start cmd: cmd, detached: false, (err, pid) ->
      should.not.exist err
      pid.should.be.a 'number'
      # Check if process started
      start_stop.running pid, (err, running) ->
        should.not.exist err
        running.should.be.true
        # Stop process
        start_stop.stop pid, (err) ->
          should.not.exist err
          # Check if process stoped
          start_stop.running pid, (err, running) ->
            should.not.exist err
            running.should.be.false
            next()
  # it 'should detach a child and restart on change', (next) ->
  #   cmd = "node #{__dirname}/start_stop/server.js"
  #   start_stop.start cmd: cmd, detached: true, watch: true, (err, pid) ->
  #     should.not.exist err
  #     pid.should.be.a 'number'
  #     # Check if process started
  #     start_stop.running pid, (err, running) ->
  #       should.not.exist err
  #       running.should.be.true
  #       # Stop process
  #       start_stop.stop pid, (err) ->
  #         should.not.exist err
  #         # Check if process stoped
  #         start_stop.running pid, (err, running) ->
  #           should.not.exist err
  #           running.should.be.false
  #           next()



