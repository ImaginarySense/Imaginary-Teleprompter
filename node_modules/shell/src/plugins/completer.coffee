
###

Completer plugin
================

Provides tab completion. Options passed during creation are:

-   `shell`  , (required) A reference to your shell application.

###
module.exports = (settings) ->
  # Validation
  throw new Error 'No shell provided' if not settings.shell
  shell = settings.shell
  # Plug completer to interface
  return unless shell.isShell
  shell.interface().completer = (text, cb) ->
    suggestions = []
    routes = shell.routes
    for route in routes
      command = route.command
      if command.substr(0, text.length) is text
        suggestions.push command
    cb(false, [suggestions, text])
  null
