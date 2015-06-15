var express = require('express'),
  router = express.Router(),
  resources = require('./../resources/config');

router.route('/').get(function (req, res, next) {
  req.result = resources.actuators;
  next();
});

router.route('/leds').get(function (req, res, next) {
  req.result = resources.actuators.leds;
  next();
});

router.route('/leds/:id').get(function (req, res, next) {
  req.result = resources.actuators.leds[req.params.id];
  next();
}).put(function(req, res, next) {
  console.log('put');
  resources.actuators.leds[req.params.id].isOn = true;
  console.log(resources.actuators);
  req.result = true;
  res.send();
});

/*
router.route('/').get(function (req, res, next) {
 res.send(resources.actuators);
});

router.route('/leds').get(function (req, res, next) {
  res.send(resources.actuators.leds);
});

router.route('/leds/:id').get(function (req, res, next) {
  res.send(resources.actuators.leds[req.params.id]);
}); */

module.exports = router;