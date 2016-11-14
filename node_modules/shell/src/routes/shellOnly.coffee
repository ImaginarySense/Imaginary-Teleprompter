
###

`routes.shellOnly`
==================

Ensure the current process is running in shell mode.

###  
module.exports = (req, res, next) ->
  if not req.shell.isShell
    res.red 'Command may only be executed inside a running shell'
    res.prompt()
    return
  next()