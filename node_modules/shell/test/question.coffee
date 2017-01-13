
should = require 'should'
shell = if process.env.SHELL_COV then require '../lib-cov/Shell' else require '../lib/Shell'
NullStream = if process.env.SHELL_COV then require '../lib-cov/NullStream' else require '../lib/NullStream'
router = if process.env.SHELL_COV then require '../lib-cov/plugins/router' else require '../lib/plugins/router'

describe 'Request question', ->
  it 'Question # req # string', (next) ->
    stdin = new NullStream
    stdout = new NullStream
    stdout.on 'data', (data) ->
      return unless data.trim()
      data.should.eql 'My question: '
      stdin.emit 'data', 'My answer\n'
    app = shell
      workspace:  "#{__dirname}/plugins_http"
      command: 'test string'
      stdin: stdin
      stdout: stdout
    app.configure ->
      app.use router shell: app
    app.cmd 'test string', (req, res) ->
      req.question 'My question:', (value) ->
        value.should.eql 'My answer'
        next()
  it 'Question # req # array of objects', (next) ->
    expects = ['Question 1 ', 'Question 2 [v 2] ']
    stdin = new NullStream
    stdout = new NullStream
    stdout.on 'data', (data) ->
      return unless data.trim()
      data.should.eql expects.shift()
      stdin.emit 'data', "Value #{2 - expects.length}\n"
    app = shell
      workspace:  "#{__dirname}/plugins_http"
      command: 'test array'
      stdin: stdin
      stdout: stdout
    app.configure ->
      app.use router shell: app
    app.cmd 'test array', (req, res) ->
      req.question [
        name: 'Question 1'
      ,
        name: 'Question 2'
        value: 'v 2'
      ], (values) ->
        values.should.eql
          'Question 1': 'Value 1'
          'Question 2': 'Value 2'
        next()
  it 'Question # req # object', (next) ->
    expects = ['Question 1 ', 'Question 2 [v 2] ', 'Question 3 [v 3] ']
    stdin = new NullStream
    stdout = new NullStream
    stdout.on 'data', (data) ->
      return unless data.trim()
      data.should.eql expects.shift()
      stdin.emit 'data', "Value #{3 - expects.length}\n"
    app = shell
      workspace:  "#{__dirname}/plugins_http"
      command: 'test object'
      stdin: stdin
      stdout: stdout
    app.configure ->
      app.use router shell: app
    app.cmd 'test object', (req, res) ->
      req.question
        'Question 1': null
        'Question 2': 'v 2'
        'Question 3': { value: 'v 3'}
      , (values) ->
        values.should.eql
          'Question 1': 'Value 1'
          'Question 2': 'Value 2'
          'Question 3': 'Value 3'
        next()
