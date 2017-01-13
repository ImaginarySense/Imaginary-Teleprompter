#!/usr/bin/env node

    var shell = require('shell');
    
    var app = shell();
    
    app.configure(function() {
        app.use(shell.history({
            shell: app
        }));
        app.use(shell.cloud9({
            ip: '0.0.0.0',
            port: '8999',
            stdout: __dirname+'/cloud9.out.log',
            stderr: __dirname+'/cloud9.err.log',
            pidfile: __dirname+'/cloud9.pid',
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
    