#!/usr/bin/env node

    var shell = require('shell'),
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
    
    // Middlewares as multiple arguments
    
    app.cmd('multiple', 'Test multiple routes', function(req, res, next){
        res.cyan('middleware 1').ln();
        next();
    }, function(req, res, next){
        res.cyan('middleware 2').ln();
        next();
    }, function(req, res, next){
        res.cyan('final callback').ln();
        res.prompt();
    });
    
    // Middlewares as an array of arguments
    
    var routes = [
        ['cmd1', 'Run command 1', function(req, res, next){
            res.cyan('Running command 1').ln();
            next();
        }],
        ['cmd2', 'Run command 2', function(req, res, next){
            res.cyan('Running command 2').ln();
            next();
        }],
        ['cmd3', 'Run command 3', function(req, res, next){
            res.cyan('Running command 3').ln();
            next();
        }]
    ];
    var middlewares = [];
    routes.forEach(function(route){
        middlewares.push(route[2]);
        app.cmd.call(null, route[0], route[1], route[2], function(req, res, next){
            res.cyan('Command "'+req.command+'" succeed');
            res.prompt();
        });
    });
    app.cmd('all', 'Run all command', middlewares, function(req, res, next){
            res.cyan('All commands succeed');
            res.prompt();
    })