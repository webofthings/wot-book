var resources = require('./../../resources/model');

var actuator;
var interval;
var me = resources.pi.actuators.leds['1'];
var pluginName = me.name;
var localParams = {'simulate': false, 'frequency': 2000};

exports.start = function (params) {
  localParams = params;
  observe(me);

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

function observe(what) {
  Object.observe(what, function (changes) {
    console.info('Change detected by plugin for %s...', pluginName);
    switchOnOff(me.value);
  });
}

function switchOnOff(value) {
  if (!params.simulate) {
    // converts boolean to number
    +value;
    value = (value + 1) % 2;
    actuator.write(value, function () {
      console.info('Changed value of %s to %i', value);
    });
  }
}

function connectHardware() {
  var Gpio = require('onoff').Gpio;
  actuator = new Gpio(14, 'out');
  console.info('Hardware %s actuator started!', pluginName);
}

function doSimulate() {
  interval = setInterval(function () {
    // Switch value on a regular basis
    if (me.value) {
      me.value = false;
    } else {
      me.value = true;
    }
  }, localParams.frequency);
  console.info('Simulated %s actuator started!', pluginName);
}
