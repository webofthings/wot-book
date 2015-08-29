var https = require('https'),
  fs = require('fs'),
  config = require('../config/acl.json').gateways[0],
  httpProxy = require('http-proxy');

var proxyServer = httpProxy.createProxyServer({
  ssl: {
    key: fs.readFileSync('./config/change_me_privateKey.pem', 'utf8'),
    cert: fs.readFileSync('./config/change_me_caCert.pem', 'utf8'),
    passphrase: 'webofthings'
  },
  secure: false
});

function proxy(req, res, next) {
  req.headers['authorization'] = config.token;
  proxyServer.web(req, res, { target: config.url });
}

module.exports = proxy;
