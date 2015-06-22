var utils = require('./../../utils/utils.js'),
  resources = require('./../../resources/model');

var interval;
var me;
var pluginName;
var localParams = {'simulate': false, 'frequency': 5000};

function configure() {
  utils.addDevice('coapDevice', 'A CoAP Device',
    'A CoAP Device',
    {
      'co2': {
        'name': 'CO2 Sensor',
        'description' : 'An ambient CO2 sensor',
        'unit': 'ppm',
        'value': 0
      }
    });
  me = resources.things.coapDevice.sensors.co2;
  pluginName = resources.things.coapDevice.name;
}

exports.start = function (params, app) {
  localParams = params;
  configure(app);

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
  var coap = require('coap'),
    bl = require('bl');

  var sensor = {
    read: function () {
      coap
        .request({
          host: 'localhost',
          port: 5683,
          pathname: '/co2',
          options: {'Accept': 'application/json'}
        })
        .on('response', function (res) {
          console.info('response code', res.code);
          if (res.code !== '2.05')
            console.log("Error while contacting CoAP service: %s", res.code);
          res.pipe(bl(function (err, data) {
            var json = JSON.parse(data);
            console.info(json);
            me.value = json.co2;
          }))
        })
        .end();

      showValue();

      setTimeout(function () {
        sensor.read();
      }, localParams.frequency);
    }
  };

  sensor.read();
}

function doSimulate() {
  interval = setInterval(function () {
    me.co2 = utils.randomInt(0, 1000)
    showValue();
  }, localParams.frequency);
  console.info('Simulated %s sensor started!', pluginName);
}

function showValue() {
  console.info('CO2 Level: %s ppm', me.value);
}


