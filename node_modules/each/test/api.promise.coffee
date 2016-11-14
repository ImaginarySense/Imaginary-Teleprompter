
should = require 'should'
each = require '../src'

describe 'promise', ->
  
  describe 'async', ->
    
    it 'run arguments only contains next', (next) ->
      each( [ 'a', 'b', 'c' ] )
      .call (next) ->
        arguments.length.should.eql 1
        next()
      .then next
      
    it 'run arguments contains element and next', (next) ->
      elements = []
      each( [ 'a', 'b', 'c' ] )
      .call (element, next) ->
        elements.push element
        next()
      .error next
      .then ->
        elements.should.eql [ 'a', 'b', 'c' ]
        next()
    
  describe 'sync', ->
    
    it 'run arguments is empty', (next) ->
      each( [ 'a', 'b', 'c' ] )
      .sync()
      .call ->
        arguments.length.should.eql 0
      .then next
      
    it 'run arguments contains element', (next) ->
      elements = []
      each( [ 'a', 'b', 'c' ] )
      .sync()
      .call (element) ->
        elements.push element
      .error next
      .then ->
        elements.should.eql [ 'a', 'b', 'c' ]
        next()
