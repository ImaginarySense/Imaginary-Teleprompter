#!/usr/bin/env node

    var fs = require('fs');
    var exec = require('child_process').exec;
    var spawn = require('child_process').spawn;
    var shell = require('shell');
    
    process.chdir(__dirname);
    
    // App
    var app = new shell({
        workspace: __dirname
    });
    app.configure(function(){
        app.use(shell.history({shell: app}));
        app.use(shell.completer({shell: app}));
        app.use(shell.http({
            stdout: __dirname + '/logs/http.out.log',
            stderr: __dirname + '/logs/http.err.log',
            pidfile: __dirname + '/tmp/http.pid',
            detached: true
        }));
        app.use(shell.router({shell: app}));
        app.use(shell.help({shell: app, introduction: true}));
        app.use(shell.error({shell: app}));
    });