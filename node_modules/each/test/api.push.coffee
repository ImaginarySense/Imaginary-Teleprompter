
should = require 'should'
each = require '../src'

describe 'push', ->

  it 'accept array elements', (next) ->
    each()
    .push('hello')
    .push('each')
    .call (item, index, next) ->
      item.should.eql 'hello' if index is 0
      next()
    .error next
    .then (count) ->
      count.should.eql 2
      next()

  it 'accept key value elements', (next) ->
    each()
    .push('hello', 'each')
    .push('youre', 'welcome')
    .call (key, value, next) ->
      value.should.eql 'each' if key is 'hello'
      next()
    .error next
    .then (count) ->
      count.should.eql 2
      next()
