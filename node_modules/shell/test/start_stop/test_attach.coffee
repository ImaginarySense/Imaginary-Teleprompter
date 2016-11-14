#!/usr/bin/env coffee

start_stop = require '../../lib/start_stop'

start_stop.start
  cmd: "#{__dirname}/server.js"
  detached: false
, (err, pid) ->
  # Keep the process active
