
// Core
var Shell = module.exports = require('./lib/Shell');
Shell.styles = require('./lib/Styles');
Shell.NullStream = require('./lib/NullStream');

// Plugins
Shell.cloud9 = require('./lib/plugins/cloud9');
Shell.coffee = require('./lib/plugins/coffee');
Shell.completer = require('./lib/plugins/completer');
Shell.error = require('./lib/plugins/error');
Shell.help = require('./lib/plugins/help');
Shell.history = require('./lib/plugins/history');
Shell.http = require('./lib/plugins/http');
Shell.router = require('./lib/plugins/router');
Shell.redis = require('./lib/plugins/redis');
Shell.stylus = require('./lib/plugins/stylus');
Shell.test = require('./lib/plugins/test');

// Routes
Shell.routes = {
  confirm: require('./lib/routes/confirm'),
  prompt: require('./lib/routes/prompt'),
  shellOnly: require('./lib/routes/shellOnly')
};

Shell.Shell = function(settings){
  console.warn('Deprecated, use `shell()` instead of `shell.Shell()`');
  return new Shell( settings );
};