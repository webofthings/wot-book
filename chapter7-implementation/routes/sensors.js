var express = require('express'),
  router = express.Router(), //#A
  resources = require('./../resources/model');

router.route('/').get(function (req, res, next) { //#B
  res.send(resources.sensors);  //#C
});

router.route('/pir').get(function (req, res, next) { //#D
  res.send(resources.sensors.pir);
});

router.route('/temperature').get(function (req, res, next) { //#E
  res.send(resources.sensors.temperature);
});

router.route('/humidity').get(function (req, res, next) { //#E
  res.send(resources.sensors.humidity);
});

module.exports = router; //#F

//#A We require and instantiate an Express Router to define the path to our resources
//#B Create a new route for a GET request on all sensors and attach a callback function
//#C Reply with the sensor model when this route is selected
//#D This route serves the passive infrared sensor
//#D This route serves the temperature and humidity sensor
//#E with :id we inject a variable in the path which will be the LED number
//#F we export to router to make it accessible for "requirers" of this file