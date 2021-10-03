const handlerFactory = require('./handler');
const { Trie } = require('route-trie');
let trie = new Trie();
let handlers = {};

exports.clear = function() {
  handlers = {};
};

exports.register = function(url, method, policies) {
  let durl = url.replace(/^([^ \\t]+) /g, '');
  trie.define(durl).label = durl;
  handlers[url] = handlerFactory.createHandler(method, policies);
};

exports.route = function(req) {
  let url = new URL(req.url);
  let match = trie.match('/' + url.hostname + url.pathname);
  if (match && match.node){
    let handler = handlers[req.method + ' ' + match.node.label];
    console.log('\x1b[0;34;40m[' + req.method + ']\x1b[0m ' + '/' + url.hostname + url.pathname);
    if (handler) {
      req.param = match.params;
      req.query = url.query;
      return handler;
    }
  }
  return this.notFound(req);
};

exports.notFound = function(req) {
  return handlerFactory.createHandler(function(req, res) {
    res();
  });
};
