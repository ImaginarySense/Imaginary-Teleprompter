
var express = require('express');

var app = module.exports = express.createServer();

app.configure(function(){
    app.use(express.favicon());
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret:'my key'}));
    app.use(app.router);
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
});

app.get('/', function(req, res, next){
    res.send('Welcome');
});

app.listen(3000);