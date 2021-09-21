const { parse } = require('querystring');
const AsyncFunction = (async () => {}).constructor;

parseCookies = function (request) {
  let list = {}, rc = request;
  rc && rc.split(';').forEach(function( cookie ) {
    let parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

Handler = function(method, policies) {
  this.process = async (req, res) => {
    req.cookies = parseCookies(req.headers.cookie);

    await bodyParser(req, res);

    if (policies instanceof Array) {
      for (let index in policies) {
        if (policyExist('./policies/' + policies[index])) {
          const method = require('./policies/' + policies[index]);
          if (method instanceof AsyncFunction === true) {
            if (! await require('./policies/' + policies[index])(req, res)) {
              return;
            }
          } else {
            if (! require('./policies/' + policies[index])(req, res)) {
              return;
            }
          }
        } else {
          console.log('Policy [' + policies[index] + '] doesn\'t exist');
        }
      }
    }
    if (!res.headersSent) {
      return method.apply(this, [req, res]);
    }
  }
};

function policyExist(name) {
  try {
    require.resolve(name);
    return true;
  } catch(e){}
  return false;
}

function bodyParser(req, res) {
  return new Promise(next => {
    // For now only JSON
    // Check if theres any data on POST
    // Because we are looking for a JSON, we only expect for on element.
    if (req['uploadData'] && req['uploadData'][0]) {
      // Grab and convert data from bytes to JSON
      let data = req['uploadData'][0]['bytes'];
      req.body = JSON.parse(data);
    }
    next();
  });
}

exports.createHandler = function (method, policies) {
  return new Handler(method, policies);
};