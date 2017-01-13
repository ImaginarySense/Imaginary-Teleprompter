
should = require 'should'
each = require '../src'

describe 'sequential', ->
  
  describe 'mode', ->
    
    it 'is default', (next) ->
      current = 0
      id2_called = false
      each( [ {id: 1}, {id: 2}, {id: 3} ] )
      .parallel(null)
      .call (element, index, next) ->
        id2_called = true if element.id is 2
        if index is 0 then setTimeout ->
          id2_called.should.be.false()
          next()
        , 100 else next()
      .then next
  
  describe 'input', ->
    
    it 'array', (next) ->
      current = 0
      end_called = false
      each( [ {id: 1}, {id: 2}, {id: 3} ] )
      .call (element, index, next) ->
        index.should.eql current
        current++
        element.id.should.eql current
        setTimeout next, 100
      .error next
      .then ->
        current.should.eql 3
        next()
        
    it 'object', (next) ->
      current = 0
      each( {id_1: 1, id_2: 2, id_3: 3} )
      .call (key, value, next) ->
        current++
        key.should.eql "id_#{current}"
        value.should.eql current
        setTimeout next, 100
      .error next
      .then ->
        current.should.eql 3
        next()
        
    it 'undefined', (next) ->
      current = 0
      each( undefined )
      .call (element, index, next) ->
        should.not.exist true
      .error next
      .then ->
        current.should.eql 0
        next()
        
    it 'null', (next) ->
      current = 0
      each( null )
      .call (element, index, next) ->
        should.not.exist true
      .error next
      .then ->
        current.should.eql 0
        next()
        
    it 'string', (next) ->
      current = 0
      each( 'id_1' )
      .call (element, index, next) ->
        index.should.eql current
        current++
        element.should.eql "id_1"
        setTimeout next, 100
      .error next
      .then ->
        current.should.eql 1
        next()
        
    it 'number', (next) ->
      current = 0
      each( 3.14 )
      .call (element, index, next) ->
        index.should.eql current
        current++
        element.should.eql 3.14
        setTimeout next, 100
      .error next
      .then ->
        current.should.eql 1
        next()
        
    it 'function', (next) ->
      current = 0
      source = (c) -> c()
      each(source)
      .call (element, index, next) ->
        index.should.eql current
        current++
        element.should.be.a.Function
        element next
      .error next
      .then ->
        current.should.eql 1
        next()
        
  describe 'multiple call error', ->
    
    it 'with end already thrown', (next) ->
      # Nothing we can do here, end has been thrown and we can not wait for it
      # Catch the uncatchable
      lsts = process.listeners 'uncaughtException'
      process.removeAllListeners 'uncaughtException'
      process.on 'uncaughtException', (err) ->
        # Test
        ended.should.be.true()
        err.message.should.eql 'Multiple call detected'
        # Cleanup and finish
        process.removeAllListeners 'uncaughtException'
        for lst in lsts
          process.on 'uncaughtException', lst
        next()
      # Run the test
      ended = false
      each( [ 'a', 'b', 'c' ] )
      .parallel(1)
      .call (item, next) ->
        next()
        # We only want to generate one error
        return unless item is 'a'
        process.nextTick next
      .then (err) ->
        ended = true
        
    it 'with end not yet thrown', (next) ->
      ended = false
      each( [ 'a', 'b', 'c' ] )
      .parallel(1)
      .call (item, next) ->
        process.nextTick ->
          next()
          # We only want to generate one error
          return unless item is 'a'
          process.nextTick next
      .error (err) ->
        ended.should.be.false()
        err.message.should.eql 'Multiple call detected'
        next()
      .then ->
        ended = true
