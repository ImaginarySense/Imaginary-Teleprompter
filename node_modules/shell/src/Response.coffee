
styles = require './Styles'
pad = require 'pad'

module.exports = class Response extends styles
  constructor: (settings) ->
    @shell = settings.shell
    super settings
  pad: pad
  prompt: ->
    @shell.prompt()
    