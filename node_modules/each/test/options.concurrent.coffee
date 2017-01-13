
should = require 'should'
each = require '../src'

describe 'Parallel', ->
  it 'Parallel # array', (next) ->
    current = 0
    end_called = false
    each( [{id: 1}, {id: 2}, {id: 3}] )
    .parallel( true )
    .call (element, index, next) ->
      index.should.eql current
      current++
      element.id.should.eql current
      setTimeout next, 100
    .error next
    .then ->
      current.should.eql 3
      next()
  it 'should handle very large array', (next) ->
    values = for i in [0..Math.pow(2, 14)] then Math.random()
    eacher = each(values)
    .parallel( true )
    .call (val, i, next) ->
      setTimeout next, 1
    .then (err) ->
      next()
  it 'Parallel # object', (next) ->
    current = 0
    each( {id_1: 1, id_2: 2, id_3: 3} )
    .parallel( true )
    .call (key, value, next) ->
      current++
      key.should.eql "id_#{current}"
      value.should.eql current
      setTimeout next, 100
    .error next
    .then ->
      current.should.eql 3
      next()
  it 'Parallel # undefined', (next) ->
    each( undefined )
    .parallel( true )
    .call (element, index, next) ->
      should.not.exist true
    .then next
  it 'Parallel # null', (next) ->
    each( null )
    .parallel( true )
    .call (element, index, next) ->
      should.not.exist true
    .then next
  it 'Parallel # string', (next) ->
    current = 0
    each( 'id_1' )
    .parallel( true )
    .call (element, index, next) ->
      index.should.eql current
      current++
      element.should.eql "id_1"
      setTimeout next, 100
    .error next
    .then ->
      current.should.eql 1
      next()
  it 'Parallel # number', (next) ->
    current = 0
    each( 3.14 )
    .parallel( true )
    .call (element, index, next) ->
      index.should.eql current
      current++
      element.should.eql 3.14
      setTimeout next, 100
    .error next
    .then ->
      current.should.eql 1
      next()
  it 'Parallel # boolean', (next) ->
    # Current tick
    current = 0
    each( false )
    .parallel( true )
    .call (element, index, next) ->
      index.should.eql 0
      current++
      element.should.not.be.ok
      next()
    .error next
    .then ->
      current.should.eql 1
      # New tick
      current = 0
      each( true )
      .parallel( true )
      .call (element, index, next) ->
        index.should.eql 0
        current++
        element.should.be.ok
        setTimeout next, 100
      .error next
      .then ->
        current.should.eql 1
        next()
  it 'Parallel # function', (next) ->
    current = 0
    source = (c) -> c()
    each( source )
    .parallel( true )
    .call (element, index, next) ->
      index.should.eql current
      current++
      element.should.be.a.Function
      element next
    .error next
    .then ->
      current.should.eql 1
      next()
    
