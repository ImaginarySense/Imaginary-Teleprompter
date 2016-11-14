
module.exports = (settings) ->
  # Validation
  throw new Error 'No shell provided' if not settings.shell
  shell = settings.shell
  # Define empty error handler to avoir shell to trow error of no event
  # handler are defined
  shell.on 'error', ->
  # Route
  (err, req, res, next) ->
    res.red(err.message).ln() if err.message
    res.red(err.stack).ln() if err.stack
    for k, v of err
      continue if k is 'message'
      continue if k is 'stack'
      continue if typeof v is 'function'
      res.magenta(k).white(': ').red(v).ln()
    res.prompt()