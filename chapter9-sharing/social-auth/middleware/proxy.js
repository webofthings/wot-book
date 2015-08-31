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
  secure: false
});

function proxy(req, res, next) {
  req.headers['authorization'] = config.token; //#C
  proxyServer.web(req, res, { target: config.url }); //#D
}
module.exports = proxy;

//#A Load the Thing that can be proxied (there is just one here)
//#B Initialize the proxy server, making it an HTTPS proxy to ensure end to end encryption
//#C Proxy middleware function, we add the secret token of the Thing
//#D Proxy the request, notice that this middleware does not call next() as it should be the last in the chain