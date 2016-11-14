
should = require 'should'
each = require '../src'

describe 'sync', ->
  
  describe 'undefined', ->
    
    it 'default to true', (next) ->
      current = 0
      each( [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] )
      .parallel( 4 )
      .sync()
      .call (element, index) ->
        index.should.eql current
        element.should.eql current
        current++
      .error next
      .then ->
        current.should.eql 10
        next()
        
  describe 'false', ->
    
    it 'run async', (next) ->
      current = 0
      each( [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] )
      .parallel( 4 )
      .sync( false )
      .call (element, next) ->
        typeof next is 'function'
        current++
      .error next
      .then ->
        current.should.eql 10
        next()
        
  describe 'true', ->
    
    it 'run item event synchronously', (next) ->
      current = 0
      each( [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] )
      .parallel( 4 )
      .sync( true )
      .call (element, index) ->
        index.should.eql current
        element.should.eql current
        current++
      .then ->
        current.should.eql 10
        next()
        
    it 'emit thrown error', (next) ->
      current = 0
      each( [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] )
      .parallel( 4 )
      .sync( true )
      .call (element, index) ->
        throw new Error 'Argh'
      .error (err) ->
        err.message.should.eql 'Argh'
        next()
        
    it 'emit returned error', (next) ->
      current = 0
      each( [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] )
      .parallel( 4 )
      .sync( true )
      .call (element, index) ->
        return new Error 'Argh'
      .error (err) ->
        err.message.should.eql 'Argh'
        next()
