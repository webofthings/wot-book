var CorePlugin = require('./corePlugin').CorePlugin,
  resources = require('./../../resources/model'),
  util = require('util');

var LedsPlugin = exports.LedsPlugin = function(params) {
  CorePlugin.call(this, params, resources.pi.actuators.leds['1']);
};

util.inherits(LedsPlugin, CorePlugin);

