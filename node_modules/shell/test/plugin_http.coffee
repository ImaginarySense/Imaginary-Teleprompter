
should = require 'should'
client = require 'http'
shell = if process.env.SHELL_COV then require '../lib-cov/Shell' else require '../lib/Shell'
NullStream = if process.env.SHELL_COV then require '../lib-cov/NullStream' else require '../lib/NullStream'
router = if process.env.SHELL_COV then require '../lib-cov/plugins/router' else require '../lib/plugins/router'
http = if process.env.SHELL_COV then require '../lib-cov/plugins/http' else require '../lib/plugins/http'

describe 'Plugin HTTP', ->
  it 'should start and stop an HTTP server in attach mode', (next) ->
    app = shell
      workspace:  "#{__dirname}/plugin_http"
      command: null
      stdin: new NullStream
      stdout: new NullStream
    app.configure ->
      app.use http detached: false
      app.use router shell: app
    app.run 'http start'
    setTimeout ->
      client.get(
        host: 'localhost'
        port: 8834
        path: '/ping'
      , (res) ->
        res.on 'data', (chunk) ->
          chunk.toString().should.eql 'pong'
          app.run 'http stop'
          setTimeout ->
            client.get(
              host: 'localhost'
              port: 8834
              path: '/ping'
            , (res) ->
              should.not.exist false
            ).on 'error', (e) ->
              e.should.be.an.instanceof Error
              next()
          , 300
      ).on 'error', (e) ->
        should.not.exist e
        next e
    , 300