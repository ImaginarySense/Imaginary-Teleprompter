#!/usr/bin/env coffee

    shell = require 'shell'
    
    app = new shell
        project_dir: __dirname
    
    app.configure ->
        app.use shell.history
            shell: app
        app.use shell.router
            shell: app
        app.use shell.coffee
            shell:   app
            stdout:  __dirname + '/coffee.out.log'
            stderr:  __dirname + '/coffee.err.log'
            pidfile: __dirname + '/coffee.pid'
            detached:  true
        app.use shell.help
            shell: app
            introduction: true
    