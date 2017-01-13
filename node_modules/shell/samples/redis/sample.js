#!/usr/bin/env node
    
var shell = require('shell');
// Initialization
var app = new shell( { chdir: __dirname } )
// Middleware registration
app.configure(function() {
    app.use(function(req, res, next){
        app.client = require('redis').createClient()
        next()
    });
    app.use(shell.history({
        shell: app
    }));
    app.use(shell.completer({
        shell: app
    }));
    app.use(shell.redis({
        config: 'redis.conf',
        pidfile: 'redis.pid',
        detached: true
    }));
    app.use(shell.router({
        shell: app
    }));
    app.use(shell.help({
        shell: app,
        introduction: true
    }));
});
// Command registration
app.cmd('redis keys :pattern', 'Find keys', function(req, res, next){
    app.client.keys(req.params.pattern, function(err, keys){
        if(err){ return res.styles.red(err.message), next(); }
        res.cyan(keys.join('\n')||'no keys');
        res.prompt();
    });
});
// Event notification
app.on('quit', function(){
    app.client.quit();
});
    