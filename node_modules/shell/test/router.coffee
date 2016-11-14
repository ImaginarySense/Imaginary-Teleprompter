
should = require 'should'
shell = if process.env.SHELL_COV then require '../lib-cov/Shell' else require '../lib/Shell'
NullStream = if process.env.SHELL_COV then require '../lib-cov/NullStream' else require '../lib/NullStream'
router = if process.env.SHELL_COV then require '../lib-cov/plugins/router' else require '../lib/plugins/router'

describe 'Plugin router', ->
  it 'Test simple', (next) ->
    app = shell
      command: 'test simple'
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use router shell: app
    app.cmd 'test simple', (req, res) ->
      next()
  it 'Test param # string', (next) ->
    app = shell
      command: 'test my_value'
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use router shell: app
    app.cmd 'test :my_param', (req, res) ->
      req.params.my_param.should.eql 'my_value'
      next()
  it 'Test param # special char', (next) ->
    app = shell
      command: 'test 12.32/abc'
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use router shell: app
    app.cmd 'test :my_param', (req, res) ->
      req.params.my_param.should.eql '12.32/abc'
      next()
  it 'Test # param with restriction # ok', (next) ->
    app = shell
      command: 'test 9034'
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use router shell: app
    app.cmd 'test :my_param([0-9]+)', (req, res) ->
      req.params.my_param.should.eql '9034'
      next()
    app.cmd 'test :my_param', (req, res) ->
      should.be.ok false
  it 'Test # param with restriction # error', (next) ->
    app = shell
      command: 'test abc'
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use router shell: app
    app.cmd 'test :my_param([0-9]+)', (req, res) ->
      should.be.ok false
    app.cmd 'test :my_param', (req, res) ->
      next()
    
