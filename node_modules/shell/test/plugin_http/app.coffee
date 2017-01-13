
express = require('express')
app = module.exports = express.createServer()

app.configure ->
  app.use express.methodOverride()
  app.use express.bodyParser()
  app.use express.cookieParser()
  app.use app.router

app.get '/ping', (req, res) ->
  res.send 'pong'

app.listen 8834 if process.argv[1] is __filename

module.exports = app
