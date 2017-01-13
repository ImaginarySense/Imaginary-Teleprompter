
pad = require 'pad'

###

Help Plugin
-----------

Display help when the user types "help" or runs commands without arguments. 
Command help is only displayed if a description was provided during the 
command registration. Additionnaly, a new `shell.help()` function is made available. 

Options passed during creation are:

-   `shell`        , (required) A reference to your shell application.
-   `introduction` , Print message 'Type "help" or press enter for a list of commands' if boolean `true`, or a custom message if a `string`

Usage

  app = shell()
  app.configure ->
    app.use shell.router shell: app
    app.use shell.help
      shell: app
      introduction: true

###
module.exports = (settings) ->
  # Validation
  throw new Error 'No shell provided' if not settings.shell
  shell = settings.shell
  # Register function
  shell.help = (req, res, next) ->
    res.cyan 'Available commands:'
    res.ln()
    routes = shell.routes
    for route in routes
      text = pad route.command, 20
      res
      .cyan(text)
      .white(route.description)
      .ln() if route.description
    res.prompt()
  # Register commands
  shell.cmd 'help', 'Show this message', shell.help.bind shell
  shell.cmd '', shell.help.bind shell
  # Print introduction message
  if shell.isShell and settings.introduction
    text =
      if   typeof settings.introduction is 'string'
      then settings.introduction
      else 'Type "help" or press enter for a list of commands'
    shell.styles.println text
