


var resources = require('./../../resources/model');

var interval;
var me = resources.pi.sensors.pir;
var pluginName = resources.pi.sensors.pir.name;
var localParams = {'simulate': false, 'frequency': 2000};


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
  var Gpio = require('onoff').Gpio;
  sensor = new Gpio(me.gpio, 'in', 'both');
  sensor.watch(function (err, value) {
    if (err) exit(err);
    showValue();
    me.value = !!value;
  });
  console.info('Hardware %s sensor started!', pluginName);
}

function doSimulate() {
  interval = setInterval(function () {
    // Switch value on a regular basis
    if (me.value) {
      me.value = false;
    } else {
      me.value = true;
    }
    showValue();
  }, localParams.frequency);
  console.info('Simulated %s sensor started!', pluginName);
}

function showValue() {
  console.info(me.value ? 'there is someone!' : 'not anymore!');
}
