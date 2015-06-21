/*
var express = require('express'),
  router = express.Router(),
  resources = require('./../resources/model');

router.route('/').get(function (req, res, next) {
  req.result = resources.actuators;
  next();
});

router.route('/leds').get(function (req, res, next) {
  req.result = resources.actuators.leds;
  next();
});

router.route('/leds/:id').get(function (req, res, next) {
  // Led Read
  req.result = resources.actuators.leds[req.params.id];
  next();
}).put(function(req, res, next) {
  // Led Update
  console.log(req.body);
  var selectedLed = resources.actuators.leds[req.params.id];
  selectedLed.isOn = req.body.isOn;
  req.result = selectedLed;
  next();
});
*/


//Initial version:

var express = require('express'),
router = express.Router(),
resources = require('./../resources/model');

router.route('/').get(function (req, res, next) { // #A
 res.send(resources.actuators); // #B
});

router.route('/leds').get(function (req, res, next) { // #C
  res.send(resources.actuators.leds);
});

router.route('/leds/:id').get(function (req, res, next) { //#D
  res.send(resources.actuators.leds[req.params.id]); //#E
});

module.exports = router;

//#A Create a new route for a GET request
//#B Reply with the actuators model when this route is selected
//#C This route serves a list of LEDs
//#D with :id we inject a variable in the path which will be the LED number
//#E the path variables are accessible via req.params.id we use this to select the right object in our model and return it


module.exports = router;