
events = require 'events'

module.exports = class NullStream extends events.EventEmitter
  # Readable Stream
  readable: true
  pause: ->
  resume: ->
  pipe: ->
  # Writable Stream
  writable: true
  write: (data) ->
    @emit 'data', data
  end: ->
    @emit 'close'
  # Shared API
  destroy: ->
  destroySoon: ->
