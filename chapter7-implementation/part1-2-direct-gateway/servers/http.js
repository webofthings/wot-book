// Final version
var express = require('express'),
  actuatorsRoutes = require('./../routes/actuators'),
  sensorRoutes = require('./../routes/sensors'),
  thingsRoutes = require('./../routes/things'),
  resources = require('./../resources/model'),
  converter = require('./../middleware/converter'),
  cors = require('cors'),
  bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.use(cors());

app.use('/pi/actuators', actuatorsRoutes);
app.use('/pi/sensors', sensorRoutes);
app.use('/things', thingsRoutes);

app.get('/pi', function (req, res) {
  res.send('This is the WoT-Pi!')
});

// For representation design
app.use(converter());
module.exports = app;


/*
 //Initial version:

var express = require('express'),
  actuatorsRoutes = require('./../routes/actuators'),
  sensorRoutes = require('./../routes/sensors'),
  resources = require('./../resources/model'), //#A
  cors = require('cors'); 

var app = express(); //#B

app.use(cors()); //#C

app.use('/pi/actuators', actuatorsRoutes); //#D
app.use('/pi/sensors', sensorRoutes);

app.get('/pi', function (req, res) { //#E
  res.send('This is the WoT-Pi!')
});

module.exports = app;

//#A Requires the Express framework, your routes, and the model
//#B Creates an application with the Express framework; this wraps an HTTP server
//#C Enable CORS support (see section 6.1.5)
//#D Binds your routes to the Express application; bind them to /pi/actuators/... and /pi/sensors/...
//#E Create a default route for /pi

*/