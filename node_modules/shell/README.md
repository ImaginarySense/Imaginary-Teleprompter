# Shell: applications with pluggable middleware

Shell brings a Connect inspired API, Express inspired routing, and other
similar functionality to console based applications.

* Run both in shell mode and command mode
* First class citizen for console application (arrows, ctrl-a, ctrl-u,...)
* User friendly with history, help messages and many other plugings
* Foundation to structure and build complex based applications
* Command matching, parameters and advanced functionnalities found in Express routing
* Flexible architecture based on middlewares for plugin creation and routing enhancement
* Familiar API for those of us using Connect or Express
* Predifined commands through plugins for Redis, HTTP servers, Cloud9, CoffeeScript, ...

Installation
------------

Shell is open source and licensed under the new BSD license.

```bash
npm install shell
```

Quick start
-----------

The example below illustrate how to code a simple Redis client.

```javascript
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
    pidfile: 'redis.pid'
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
```

Creating and Configuring a Shell
--------------------------------

```javascript
var app = shell();
app.configure(function() {
  app.use(shell.history({shell: app}));
  app.use(shell.completer({shell: app}));
  app.use(shell.help({shell: app, introduction: true}));
});
app.configure('prod', function() {
  app.set('title', 'Production Mode');
});
```

Shell settings
--------------

The constructor `shell` takes an optional object. Options are:

-   `chdir`      , Changes the current working directory of the process, a string of the directory, boolean true will default to the `workspace` (in which case `workspace` must be provided or discoverable)
-   `prompt`     , Character for command prompt, Defaults to ">>"
-   `stdin`      , Source to read from
-   `stdout`     , Destination to write to
-   `env`        , Running environment, Defaults to the `env` setting (or `NODE_ENV` if defined, eg: `production`, `develepment`).
-   `isShell`    , Detect whether the command is runned inside a shell are as a single command.
-   `noPrompt`   , Do not prompt the user for a command, usefull to plug your own starting mechanisme (eg: starting with a question).
-   `workspace`  , Project root directory or null if none was found. The discovery strategy start from the current working directory and traverse each parent dir looking for a `node_module` directory or a `package.json` file.

Shell settings may be set by calling `app.set('key', value)`.  They can be retrieved by calling the same function without a second argument.

```javascript
var app = new shell({
  chdir: true
});
app.set('env', 'prod');
app.configure('prod', function() {
  console.log(app.set('env'));
});
```

As with Express, `app.configure` allows the customization of plugins for all or specific environments, while `app.use` registers plugins.

If `app.configure` is called without specifying the environment as the first argument, the provided callback is always called. Otherwise, the environment must match the `env` setting or the global variable `NODE_ENV`.

Middlewares and plugins
-----------------------

Shell is build on a middleware architecture. When a command is issued, multiple callbacks are executed sequentially until one decide to stop the process  (calling `res.prompt()` or `shell.quit`. Those callbacks are called middlewares. A callback recieve 3 arguments: a `request` object, a `response` object and the next callback. Traditionnaly, `request` deals with `stdin` while `response` deals with `stdout`.

A plugin is simply a function which configure and return a middleware. Same plugin also enrich the Shell application with new routes and functions.

Shell events
------------

The following events may be emitted:

-   `"command"`  , listen to all executed commands, provide the command name as first argument.
-   `#{command}` , listen to a particular event.
-   `"quit"`     , called when the application is about to quit.
-   `"error"`    , called on error providing the error object as the first callback argument.
-   `"exit"`     , called when the process exit.

Request parameter
-----------------

The request object contains the following properties:

-   `shell`   , (required) A reference to your shell application.
-   `command` , Command entered by the user
-   `params`  , Parameters object extracted from the command, defined by the `shell.router` middleware
-   `qestion` , Ask questions with optionally suggested and default answers
-   `confirm` , Ask a question expecting a boolean answer

Response parameter
------------------

The response object inherits from styles containing methods for printing, coloring and bolding:

Colors:

-   `black`
-   `white`
-   `yellow`
-   `blue`
-   `cyan`
-   `green`
-   `magenta`
-   `red`
-   `bgcolor`
-   `color`
-   `nocolor`

Style:

-   `regular`
-   `weight`
-   `bold`

Display:


-   `prompt`     , Exits the current command and return user to the prompt.
-   `ln`         , Print a new line
-   `print`      , Print a text
-   `println`    , Print a text followed by a new line
-   `reset`      , Stop any formating like color or bold
-   `pad`        , Print a text with a fixed padding
-   `raw`        , Return a text

Router plugin
-------------

The functionality provided by the 'routes' module is very similar to that of
express.  Options passed during creation are:

-   `shell`     , (required) A reference to your shell application.
-   `sensitive` , (optional) Defaults to `false`, set to `true` if the match should be case sensitive.

New routes are defined with the `cmd` method. A route is made of pattern against which the user command is matched, an optional description and one or more route specific middlewares to handle the command. The pattern is either a string or a regular expression. Middlewares receive three parameters: a request object, a response object, and a function. Command parameters are substituted and made available in the `params` object of the request parameter.

Parameters can have restrictions in parenthesis immediately following the
keyword, as in express: `:id([0-9]+)`.  See the `list` route in the example:

```javascript
var app = new shell();
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

// Command with parameter
app.cmd('user :uid', auth, function(req, res){
  res.cyan('Yes, you are ' + req.params.username);
});

// Command with contrained parameter
app.cmd('user :id([0-9]+)', function(req, res) {
  res.cyan('User id is ' + req.params.id);
  res.prompt();
});
```

Contributors
------------

*   David Worms : <https://github.com/wdavidw>
*   Tony: <https://github.com/Zearin>
*   Russ Frank : <https://github.com/russfrank>
