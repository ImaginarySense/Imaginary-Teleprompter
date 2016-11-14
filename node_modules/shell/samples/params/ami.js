#!/usr/bin/env node

    var shell = require('../..');
    var exec = require('child_process').exec;

    var app = shell();
    app.configure(function(){
        app.use(shell.router({
            shell: app
        }));
    });
    // Route middleware
    var auth = function(req, res, next){
    	if(req.params.uid == process.getuid()){
    		next()
    	}else{
    		throw new Error('Not me');
    	}
    }
    // Global parameter substitution
    app.param('uid', function(req, res, next){
    	exec('whoami', function(err, stdout, sdterr){
    		req.params.username = stdout;
    		next();
    	});
    });
    // Simple command
    app.cmd('help', function(req, res){
    	res.cyan('Run this command `./ami user ' + process.getuid() + '`');
    	res.prompt()
    });
    // Command with parameter and two route middlewares
    app.cmd('user :uid', auth, function(req, res){
    	res.cyan('Yes, you are ' + req.params.username);
    });
