var resources = require('./../resources/model');

var interval;
var me = resources.sensors;
var pluginName = 'Temperature & Humidity'
var localParams = {'simulate': false, 'frequency': 5000};

exports.start = function (params) {
  localParams = params;

  if (params.simulate) {
    doSimulate();
  } else {
    connectHardware();
  }
}

exports.stop = function () {
  if (params.simulate) {
    clearInterval(interval);
  } else {
    sensor.unexport();
  }
  console.info('%s plugin stopped!', pluginName);
}

function connectHardware() {
 var sensorDriver = require('node-dht-sensor');
  var sensor = {
    initialize: function () {
      return sensorDriver.initialize(22, 21);
    },
    read: function () {
      var readout = sensorDriver.read();
      me.temperature.value = parseFloat(readout.temperature.toFixed(2));
      me.humidity.value = parseFloat(readout.humidity.toFixed(2));

      console.info('Temperature: %s C, humidity %s \%',
        me.temperature.value, me.humidity.value);

      setTimeout(function () {
        sensor.read();
      }, localParams.frequency);
    }
  };

  if (sensor.initialize()) {
    console.info('Hardware %s sensor started!', pluginName);
    sensor.read();
  } else {
    console.warn('Failed to initialize sensor!');
  }
}

function doSimulate() {
  interval = setInterval(function () {
    me.temperature.value = Math.random();
    me.humidity.value = Math.random();
  }, localParams.frequency);
  console.info('Simulated %s sensor started!', pluginName);
}
