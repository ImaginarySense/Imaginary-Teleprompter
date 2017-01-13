
should = require 'should'
each = require '../src'

describe 'Close', ->
  
  it 'should work in sequential', (next) ->
    count = 0
    eacher = each([0,1,2,3,4,5,6,7,8,9])
    .parallel(false)
    .call (element, next) ->
      count++
      return next() if count < 5
      return eacher.close() if count is 5
      false.should.be.true()
    .then (err) ->
      count.should.eql 5 unless err
      next err
      
  it 'should work in parallel', (next) ->
    count = 0
    eacher = each([0,1,2,3,4,5,6,7,8,9])
    .parallel(true)
    .call (element, next) ->
      count++
      return next() if count < 5
      return eacher.close() if count is 5
      false.should.be.true()
    .then (err) ->
      count.should.eql 5 unless err
      next err
      
  it 'should work with times', (next) ->
    count = 0
    eacher = each()
    .parallel(false)
    .times(10)
    .call (element, next) ->
      count++
      return next() if count < 5
      return eacher.close() if count is 5
      false.should.be.true()
    .then (err) ->
      count.should.eql 5 unless err
      next err
