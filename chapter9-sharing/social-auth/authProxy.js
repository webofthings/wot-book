var express = require('express'),
  https = require('https'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  cons = require('consolidate'),
  auth = require('./middleware/auth'),
  fb = require('./providers/facebook.js'),
  proxy = require('./middleware/proxy.js'),
  config = require('./config/acl.json').config;

var key_file = './config/change_me_privateKey.pem';
var cert_file = './config/change_me_caCert.pem';
var passphrase = 'webofthings';

var tlsConfig = {
  key: fs.readFileSync(key_file),
  cert: fs.readFileSync(cert_file),
  passphrase: passphrase
};


var app = express();
app.use(bodyParser.json());
app.use(auth.socialTokenAuth());

// configure Express
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.engine('html', cons.handlebars);
app.set('view engine', 'html');

// add the FB auth support and pages
fb.setupFacebookAuth(app);
app.use(proxy());

var httpServer = https.createServer(tlsConfig, app);
httpServer.listen(config.sourcePort, function () {
  console.log('WoT Social Authentication Proxy started on port: %d', config.sourcePort);
});

