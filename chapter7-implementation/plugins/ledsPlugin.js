var resources = require('./../resources/config');

Object.observe(resources.actuators.leds['1'], function (changes) {
  console.log('Plugin detected request for LED change...');
  console.log(changes);
})