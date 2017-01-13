
shell = require '..'
app = shell()
app.configure ->
    app.use shell.router shell: app

app.cmd 'test', (req, res, next) ->
    req.question 'Are you sure [yes|no]', (answer) ->
        console.log 'answer is: ', answer
