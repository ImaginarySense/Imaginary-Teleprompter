
should = require 'should'
each = require '../src'

describe 'then', ->
  
  it 'rethrow if error', (next) ->
    lsts = process.listeners 'uncaughtException'
    process.removeAllListeners 'uncaughtException'
    process.on 'uncaughtException', (err) ->
      err.message.should.eql 'User Error'
      process.removeAllListeners 'uncaughtException'
      for lst in lsts
        process.on 'uncaughtException', lst
      next()
    eacher = each()
    .times(10)
    .call (element, index, next) ->
      next()
    .then (err) ->
      throw Error 'User Error'
  
  
