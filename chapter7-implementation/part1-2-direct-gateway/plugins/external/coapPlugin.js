var utils = require('./../../utils/utils.js'),
  resources = require('./../../resources/model');

var interval, me, pluginName, pollInterval;
var localParams = {'simulate': false, 'frequency': 5000};

function connectHardware() {
  var coap = require('coap'),
    bl = require('bl'); //#A

  var sensor = {
    read: function () { //#B
      coap
        .request({ //#C
          host: 'localhost',
          port: 5683,
          pathname: '/co2',
          options: {'Accept': 'application/json'}
        })
        .on('response', function (res) { //#D
          console.info('CoAP response code', res.code);
          if (res.code !== '2.05')
            console.log("Error while contacting CoAP service: %s", res.code);
          res.pipe(bl(function (err, data) { //#E
            var json = JSON.parse(data);
            me.value = json.co2;
            showValue();
          }));
        })
        .end();
    }
  };
  pollInterval = setInterval(function () { //#F
    sensor.read();
  }, localParams.frequency);
};

function configure() { //#G
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
};
//#A Require the CoAP and BL library, a Buffer helper
//#B Create a sensor object and give it a read function
//#C The read function wraps a coap over UDP request with the enclosed parameters; replace localhost with the IP of the machine you’re simulating the CoAP device from (e.g., your laptop)
//#D When CoAP device sends the result, the on response event is triggered
//#E Fetch the results and update the model
//#F Poll the CoAP device for new CO2 readings on a regular basis
//#G Add the resources managed by this plugin to the model


exports.start = function (params, app) {
  localParams = params;
  configure(app);

  if (params.simulate) {
    simulate();
  } else {
    connectHardware();
  }
};

exports.stop = function () {
  if (params.simulate) {
    clearInterval(interval);
  } else {
    clearInterval(pollInterval);
  }
  console.info('%s plugin stopped!', pluginName);
};

function simulate() {
  interval = setInterval(function () {
    me.value = utils.randomInt(0, 1000);
    showValue();
  }, localParams.frequency);
  console.info('Simulated %s sensor started!', pluginName);
};

function showValue() {
  console.info('CO2 Level: %s ppm', me.value);
};