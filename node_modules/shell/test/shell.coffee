
should = require 'should'
shell = if process.env.SHELL_COV then require '../lib-cov/Shell' else require '../lib/Shell'
NullStream = if process.env.SHELL_COV then require '../lib-cov/NullStream' else require '../lib/NullStream'

describe 'Shell', ->
  ###
  Note
  version 0.4.x didn't hold currentprocess if `process.stdin`
  was referenced, so `app.quit()` was not required
  ###
  it 'should construct with new call', ->
    app = new shell
      command: ''
      stdin: new NullStream
      stdout: new NullStream
    app.should.be.an.instanceof shell
    app.quit()
  it 'should construct with function call', ->
    app = shell
      command: ''
      stdin: new NullStream
      stdout: new NullStream
    app.should.be.an.instanceof shell
    app.quit()