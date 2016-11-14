#!/usr/bin/env node

    var spawn = require('child_process').spawn,
        shell = require('shell'),
        app = new shell();
        
    app.configure(function(){
        app.use(shell.router({shell: app}));
        app.use(shell.help({shell: app, introduction: true}));
        app.use(shell.error({shell: app}));
    });
    
    app.on('exit', function(){
        if(app.server){ app.server.kill(); }
        if(app.client){ app.client.quit(); }
    });
    
    app.cmd('error throw', 'Throw an error', function(req, res, next){
        throw new Error('Test throw error');
    });
    
    app.cmd('error next', 'Pass an error in next', function(req, res, next){
        next(new Error('Test next error'));
    });