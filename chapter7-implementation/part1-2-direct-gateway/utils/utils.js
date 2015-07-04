var resources = require('./../resources/model');

exports.addDevice = function(id, name, description, sensors, actuators) {
  if(!resources.things) {
    resources.things = {};
  }
  resources.things[id] = {'name' : name,
    'description' : description,
    'sensors' : sensors,
    'actuators' : actuators
  }
};

exports.randomInt = function(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
};