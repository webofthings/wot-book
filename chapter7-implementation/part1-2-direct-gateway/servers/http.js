var express = require('express'),
  actuatorsRoutes = require('./../routes/actuators'),
  sensorRoutes = require('./../routes/sensors'),
  thingsRoutes = require('./../routes/things'),
  resources = require('./../resources/model'),
  converter = require('./../middleware/converter'),
  bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.use('/pi/actuators', actuatorsRoutes);
app.use('/pi/sensors', sensorRoutes);
app.use('/things', thingsRoutes);

app.get('/pi', function (req, res) {
  res.send('This is the WoT-Pi!')
});

// For representation design
app.use(converter);


// issue with WS: see: https://github.com/HenningM/express-ws/issues/10
// catch 404 and forward to error handler
//app.use(function(req, res, next) {
  //var err = new Error('Resource not Found');
  //err.status = 404;
  //next(err);
//});

module.exports = app;


/*
 //Initial version:

var express = require('express'),
  actuatorsRoutes = require('./../routes/actuators'),
  sensorRoutes = require('./../routes/sensors'),
  resources = require('./../resources/model'); //#A

var app = express(); //#B

app.use('/pi/actuators', actuatorsRoutes); //#C
app.use('/pi/sensors', sensorRoutes);

app.get('/pi', function (req, res) { //#D
  res.send('This is the WoT-Pi!')
});

module.exports = app;

//#A Requires the Express framework, our routes and the model
//#B Creates an application with the Express framework, this wraps an HTTP server
//#C Binds our routes to the Express application we bind them to /pi/actuators/... and /pi/sensors/...
//#D Create a default route for /pi

*/