var express = require('express'),
  router = express.Router(),
  resources = require('./../resources/config');

router.route('/').get(function (req, res, next) {
  res.send(resources.sensors);
});

router.route('/pir').get(function (req, res, next) {
  res.send(resources.sensors.pir);
});

module.exports = router;