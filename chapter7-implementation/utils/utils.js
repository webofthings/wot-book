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