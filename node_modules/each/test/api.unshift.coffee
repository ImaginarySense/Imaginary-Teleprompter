
should = require 'should'
each = require '../src'

describe 'unshift', ->

  it 'accept array elements', (next) ->
    each()
    .unshift('hello')
    .unshift('each')
    .call (item, index, next) ->
      item.should.eql 'each' if index is 0
      next()
    .then (err, count) ->
      should.not.exist err
      count.should.eql 2
      next()

  it 'accept key value elements', (next) ->
    each()
    .unshift('hello', 'each')
    .unshift('youre', 'welcome')
    .call (key, value, next) ->
      value.should.eql 'welcome' if key is 'youre'
      next()
    .then (err, count) ->
      should.not.exist err
      count.should.eql 2
      next()

  it 'should place the next element', (next) ->
    last = null
    e = each(['a','b','c'])
    .call (value, next) ->
      if value is 'a'
        e.unshift 'aa'
      if last is 'a'
        value.should.eql 'aa'
      if last is 'aa'
        value.should.eql 'b'
      last = value
      next()
    .then (err, count) ->
      should.not.exist err
      count.should.eql 4
      next()
