
should = require 'should'
each = require '../src'

describe 'files', ->
  
  it 'traverse a globing expression', (next) ->
    files = []
    each()
    .parallel(true)
    .files("#{__dirname}/../test/mode.*.coffee")
    .call (file, next) ->
      files.push file
      setImmediate next
    .error next
    .then ->
      files.length.should.eql 2
      next()
      
  it 'traverse multiple globing expressions', (next) ->
    files = []
    each()
    .parallel(true)
    .files([
      "#{__dirname}/../src/*.coffee"
      "#{__dirname}/../test/mode.*.coffee"
    ])
    .call (file, next) ->
      files.push file
      setImmediate next
    .error next
    .then ->
      files.length.should.eql 3
      next()
      
  it 'call end if no match', (next) ->
    files = []
    each()
    .parallel(true)
    .files("#{__dirname}/../test/does/not/exist")
    .call (file, next) ->
      files.push file
      setImmediate next
    .error next
    .then ->
      files.should.eql []
      next()
      
  it 'emit if match a file', (next) ->
    files = []
    each()
    .parallel(true)
    .files("#{__dirname}/api.files.coffee")
    .call (file, next) ->
      files.push file
      setImmediate next
    .error next
    .then ->
      files.should.eql ["#{__dirname}/api.files.coffee"]
      next()
      
  it 'emit if match a directory', (next) ->
    files = []
    each()
    .parallel(true)
    .files(__dirname)
    .call (file, next) ->
      files.push file
      setImmediate next
    .error next
    .then ->
      files.should.eql [__dirname]
      next()
