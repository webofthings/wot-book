var express = require('express'),
  router = express.Router(),
  resources = require('./../resources/model');

router.route('/coapDevice/sensors/co2').get(function (req, res, next) {
  req.result = resources.things.coapDevice.sensors.co2
  next();
});

module.exports = router;