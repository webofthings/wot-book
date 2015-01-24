var express = require('express')
var app = express()
var cons = require('consolidate')


// This is just to get the external IP address to access this device
var os = require('os');
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}


// Setup all the templating stuff
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');


// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500);
    res.render('error_template', { error: err });
}

app.use(errorHandler);


/*
	device will need to have support for API keys
*/


// We need a master object to hold the list of all sensors, actuators, config of the device, etc.

var myself = {
	'name':'WoT Gateway @ EVRYTHNG',
	'ip' : addresses[0]
}

// 
var devices = {
	'pi':{
		'id':'klklsjfdamlsadk',
		'name':'My WoT Raspberry PI',
		'description':'A simple WoT-connected Raspberry PI for the WoT book.',
		'url':'https://devices.webofthings.io/pi',
		'version':'v0.1',
		'tags':['raspberry','pi','WoT'],
		'ip' : addresses[0],
		'elements':{
	   		'sensors':{'url':'sensors','doc':'The list of sensors'},
	   		'actuators':{'url':'actuators','doc':'The list of actuators'},
	   		'debug':{'url':'doc','doc':'The debug channel'},
	   		'docs':{'url':'doc','doc':'The documentation for this device'}
	   	}
	},
	'camera':{
		'id':'klklsjfdamlsadk',
		'name':'My WoT Camera',
		'description':'A simple WoT-connected camera.',
		'url':'https://devices.webofthings.io/camera',
		'version':'v0.1',
		'tags':['camera','WoT'],
		'ip' : addresses[0],
		'elements':{
	   		'sensors':{'url':'sensors','doc':'The list of sensors'},
	   		'actuators':{'url':'actuators','doc':'The list of actuators'},
	   		'debug':{'url':'doc','doc':'The debug channel'},
	   		'docs':{'url':'doc','doc':'The documentation for this device'}
	   	}
	}
}


var sensors = {
	'pi': {
		'gpio':{
			'name':'General Purpose IO',
			'description':'The general-purpose input-output pins.'},
		'temperature':{
			'name':'Temperature Sensor',
			'description':'A temperature sensor.','unit':'celsius','value':'22'},
		'pir':{
			'name':'Passive Infrared',
			'description':'A passive infrared sensor. When true someone is present.','type':'boolean','value':false}
	},
	'camera':{
		'ccd':{
			'name':'Camera Sensor',
			'description':'The CCD sensor on the camera.'}
	}
}

;

var actuators = {
	'pi':{
		'display':{			
			'name':'LCD Display screen',
			'description':'A simple display that can write commands.',
			'properties':[
				{
					'name':'brightness',
					'timestamp':'today',
					'value':80,
					'unit':'%',
					'type':'integer',
					'description':'Percentace of brightness of the display. Min is 0 which is black, max is 100 which is white.'
				},{
					'name':'text'
				}
			],
			'commands':['write','clear','blink','color','brightness']
		},
		'leds':{
			'name':'General Purpose IO',
			'description':'LEDs on the device',
			'properties':[
				{
					'name':'rgb-led0',
					'timestamp':'today',
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #0 in RGB. Min 0, max 255. Green is [0,255,0].'
				},
				{
					'name':'rgb-led1',
					'timestamp':'today',
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #1 in RGB. Min 0, max 255.'
				},
				{
					'name':'binary-led0',
					'timestamp':'today',
					'value':true,
					'unit':'intensity',
					'type':'boolean',
					'description':'Setting of binary LED #0. True for led on, false for led off.'
				}
			]
		}
	},
	'camera':{
		'debug':{
			'name':'Debug port',
			'description':'A basic debug port to be used for reset & other admin functionality. Ideally do not use.'
		}
	}
}



var properties = [
	{'name':'battery-level-percent','value':'80','timestamp':'','description':''},
	{'name':'status','value':'OK','timestamp':'','description':''},
	{'name':'leds','description':''}
];



// GETs the list of all devices connected here
app.get('/', function (req, res) {

	res.format({
	    html: function(){
  			res.render('index', {names: Object.keys(devices), devices: devices, myself: myself });
	    },

	    json: function(){
			res.json(devices);
	    }
  	});	

	console.log('Request (%s %s)', req.method, req.url);
})



// GETs a specific device
app.get('/:id', function (req, res) { // Gets a specific device

	res.format({
	    html: function(){
  			res.render('device', {deviceId: req.params.id, device: devices[req.params.id]});
	    },

	    json: function(){
			res.json(devices[req.params.id]);
	    }
  	});	

  	//res.send('user' + req.params.id);

	console.log('Request (%s %s)', req.method, req.url);
})


// accept GET on list of sensors
app.get('/:id/sensors', function (req, res) {

	res.format({
	    html: function(){
  			res.render('sensors', {deviceId: req.params.id, names: Object.keys(sensors[req.params.id]), device: devices[req.params.id], sensors: sensors[req.params.id]});
	    },

	    json: function(){
			res.json(sensors[req.params.id]);	    
		}
	});	

	console.log('Request (%s %s)', req.method, req.url)
})




// accept GET request on the temp sensor
app.get('/:id/sensors/:type', function (req, res) {
	
	res.format({
	    html: function(){
  			res.render('sensor', {deviceId: req.params.id,  device: devices[req.params.id], sensors: sensors[req.params.id][req.params.type]});
	    },

	    json: function(){
			res.json(sensors[req.params.id][req.params.type]);	    
		}
	});	

	console.log('Request (%s %s)', req.method, req.url)

})

// accept GET request on the temp sensor
app.get('/:id/sensors/:type/value', function (req, res) {

	var value = Math.random();
	var result = {'value': value};
  	//res.json(result); // This generates a random value for this sensor
	
	res.format({
	    html: function(){
  			res.render('sensor', {deviceId: req.params.id,  device: devices[req.params.id], sensors: sensors[req.params.id][req.params.type]});
	    },

	    json: function(){
			res.json(result);	    
		}
	});	

	console.log('Request (%s %s)', req.method, req.url)

})


// accept GET on actuators
app.get('/:id/actuators', function (req, res) {

	res.format({
	    html: function(){
  			res.render('actuators', {deviceId: req.params.id,  device: devices[req.params.id], actuators: actuators[req.params.id]});
	    },

	    json: function(){
			res.json(actuators[req.params.id]);	    
		}
	});	

	console.log('Request (%s %s)', req.method, req.url)
})

// GET on actuators of a device
app.get('/:id/actuators/:type', function (req, res) {

	res.format({
	    html: function(){
  			res.render('actuator', {deviceId: req.params.id,  device: devices[req.params.id], actuators: actuators[req.params.id]});
	    },

	    json: function(){
			res.json(actuators[req.params.id][req.params.type]);	    
		}
	});	
})




/*------------------- NOT USED YET -------------------*/

// accept GET on subscriptions - NOT used
app.get('/:id/subscriptions', function (req, res) {
  	res.json(actuators);
	console.log('Request (%s %s)', req.method, req.url)
})


// accept POST on LEDs
app.put('/:id/actuators/:type/', function (req, res) {
	var result = {'status' : 'on'};
  	res.json(result);
	console.log('Changing status of the LED to %s', result)

	console.log('Request (%s %s)', req.method, req.url)
})



// We now start the server
var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Your WoT device is running at http://%s:%s', addresses[0], port)
})