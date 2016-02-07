var https = require('https'),
  fs = require('fs'),
  config = require('../config/acl.json').things[0], //#A
  httpProxy = require('http-proxy');

var proxyServer = httpProxy.createProxyServer({ //#B
  ssl: {
    key: fs.readFileSync('./config/change_me_privateKey.pem', 'utf8'),
    cert: fs.readFileSync('./config/change_me_caCert.pem', 'utf8'),
    passphrase: 'webofthings'
  },
  secure: false //#C
});

module.exports = function() {
  return function proxy(req, res, next) {
    req.headers['authorization'] = config.token; //#D
    proxyServer.web(req, res, {target: config.url}); //#E
  }
};

//#A Load the Thing that can be proxied (there’s just one here)
//#B Initialize the proxy server, making it an HTTPS proxy to ensure end-to-end encryption
//#C Do not verify the certificate (true would refuse local certificate)
//#D Proxy middleware function; add the secret token of the Thing
//#E Proxy the request; notice that this middleware doesn’t call next() because it should be the last in the chain
