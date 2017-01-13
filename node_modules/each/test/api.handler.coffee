
should = require 'should'
each = require '../src'

describe 'handler', ->
  
  describe 'arguments from array', ->
        
    it 'get next argument', (next) ->
      each( [ 'a', 'b', 'c' ] )
      .call (next) ->
        arguments.length.should.eql 1
        next()
      .then next
      
    it 'get element and next argument', (next) ->
      each( [ 'a', 'b', 'c' ] )
      .call (element, next) ->
        ['a', 'b', 'c'].should.containEql element
        next()
      .then next
      
    it 'get element, index and next argument', (next) ->
      each( [ 'a', 'b', 'c' ] )
      .call (element, index, next) ->
        ['a', 'b', 'c'].should.containEql element
        index.should.be.a.Number()
        next()
      .then next
      
    it 'throw error with no argument', (next) ->
      each( ['a', 'b', 'c'] )
      .call () ->
        false.should.be.true()
      .then (err) ->
        err.message.should.eql 'Invalid arguments in item callback'
        next()
        
  describe 'arguments from object', ->
    
    it 'get next argument', (next) ->
      each( {a: 1, b: 2, c: 3} )
      .call (next) ->
        arguments.length.should.eql 1
        next()
      .then next
      
    it 'get value and next argument', (next) ->
      each( {a: 1, b: 2, c: 3} )
      .call (value, next) ->
        value.should.be.a.Number()
        next()
      .then next
      
    it 'get key, value and next argument', (next) ->
      each( {a: 1, b: 2, c: 3} )
      .call (key, value, next) ->
        ['a', 'b', 'c'].should.containEql key
        value.should.be.a.Number()
        next()
      .then next
      
    it 'get key, value, index and next argument', (next) ->
      each( {a: 1, b: 2, c: 3} )
      .call (key, value, counter, next) ->
        ['a', 'b', 'c'].should.containEql key
        value.should.be.a.Number()
        counter.should.be.a.Number()
        next()
      .then next
      
    it 'throw error with no argument', (next) ->
      each( {a: 1, b: 2, c: 3} )
      .call () ->
        false.should.be.true()
      .then (err) ->
        err.message.should.eql 'Invalid arguments in item callback'
        next()
        
  describe 'array', ->
        
    it 'called immediatly', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .call [
        (val, next) -> data.push(val+'a') and next()
        (val, next) -> data.push(val+'b') and next()
      ]
      .error next
      .then ->
        data.should.eql ['1a', '1b', '2a', '2b', '3a', '3b']
        next()
              
    it 'called with delay', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .parallel true
      .call [
        (val, next) -> data.push(val+'a') and next()
        (val, next) -> process.nextTick (-> data.push(val+'b') and next())
      ]
      .error next
      .then ->
        # Not sure how to explain this result, i would have expected
        # ['1a', '2a', '3a', '1b', '2b', '3b']
        data.should.eql ['1a', '2a', '3a', '3b', '2b', '1b']
        next()
        
  describe 'chain', ->
        
    it 'called with delay', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .parallel true
      .call (val, next) -> data.push(val+'a') and next()
      .call (val, next) -> data.push(val+'b') and next()
      .error next
      .then ->
        data.should.eql ['1a', '2a', '3a', '1b', '2b', '3b']
        next()
              
    it 'catch error in first handler', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .parallel true
      .call (val, next) -> throw Error 'Catchme'
      .call (val, next) -> next()
      .error (err) ->
        err.message.should.eql 'Catchme'
        next()
      .then ->
        false.should.be.true()
              
    it 'catch error in last handler', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .parallel true
      .call (val, next) -> next()
      .call (val, next) -> throw Error 'Catchme'
      .error (err) ->
        err.message.should.eql 'Catchme'
        next()
      .then ->
        false.should.be.true()
              
    it 'get error in first handler', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .parallel true
      .call (val, next) -> setImmediate next Error 'Catchme'
      .call (val, next) -> next()
      .error (err) ->
        err.message.should.eql 'Catchme'
        next()
      .then ->
        false.should.be.true()
              
    it 'get error in last handler', (next) ->
      data = []
      each( [ '1', '2', '3' ] )
      .parallel true
      .call (val, next) -> next()
      .call (val, next) -> setImmediate next Error 'Catchme'
      .error (err) ->
        err.message.should.eql 'Catchme'
        next()
      .then ->
        false.should.be.true()
