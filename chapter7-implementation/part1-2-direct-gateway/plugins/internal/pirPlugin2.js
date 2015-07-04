var CorePlugin = require('./corePlugin').CorePlugin,
  resources = require('./../../resources/model'),
  util = require('util');

var PirPlugin = exports.PirPlugin = function(params) {
  CorePlugin.call(this, params, resources.pi.sensors.pir);
};

util.inherits(PirPlugin, CorePlugin);

