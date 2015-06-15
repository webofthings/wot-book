var express = require('express'),
  actuatorsRoutes = require('./../routes/actuators'),
  sensorRoutes = require('./../routes/sensors'),
  resources = require('./../resources/config'),
  converter = require('./../middleware/converter'),
  bodyParser = require('body-parser');

var app = express();

app.use('/actuators', actuatorsRoutes);
app.use('/sensors', sensorRoutes);

app.get('/', function (req, res) {
  res.send('This is the WoT-Pi!')
});

// For representation design
app.use(converter);

// For interface
app.use(bodyParser.json()); // for parsing application/json


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Resource not Found');
  err.status = 404;
  next(err);
});

// plugins
var ledsPlugin = require('../plugins/ledsPlugin');


module.exports = app;

