var express = require('express'),
cors = require('cors'),
app = express(),
cons = require('consolidate'),
http = require('http'),
WebSocketServer = require('ws').Server;


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

// To parse the the body of incoming HTTP requests
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


// Activate CORS
app.use(cors());


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

// This is the gateway data structure.
var myself = {
	'name':'WoT Gateway @ EVRYTHNG',
	'ip' : addresses[0]
}


// The timestamp when the server was started.
startTime = new Date();//.toString();


// We need a master object to hold the list of all sensors, actuators, config of the device, etc.
var devices = {
	'pi':{
		'id':'1',
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
		'id':'2',
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
			'description':'A temperature sensor.',
			'unit':'celsius',
			'value':22,
			'timestamp': startTime
		},
		'pir':{
			'name':'Passive Infrared',
			'description':'A passive infrared sensor. When true someone is present.','type':'boolean','value':true},
			'value':22,
			'type':'boolean',
			'timestamp': startTime			
	},
	'camera':{
		'ccd':{
			'name':'Camera Sensor',
			'url':'cam',
			'type':'image/jpg',
			'description':'The CCD sensor on the camera.'}
	}
};

var actuators = {
	'pi':{
		'display':{			
			'name':'LCD Display screen',
			'description':'A simple display that can write commands.',
			'properties':{
				'brightness':{
					'name':'Brightness',
					'timestamp': startTime,
					'value':80,
					'unit':'%',
					'type':'integer',
					'description':'Percentace of brightness of the display. Min is 0 which is black, max is 100 which is white.'
				},
				'content':{
					'name':'Content',
					'timestamp': startTime,
					'value':'Hello World!',
					'type':'string',
					'description':'The text to display on the LCD screen.'
				},
				'duration':{
					'name':'Display Duration',
					'timestamp': startTime,
					'value':5000,
					'unit':'milliseconds',
					'type':'integer',
					'read-only':true,
					'description':'The duration for how long text will be displayed on the LCD screen.'					
				}
			},
			'commands':['write','clear','blink','color','brightness']
		},
		'leds':{
			'name':'LEDs',
			'description':'LEDs on the device',
			'properties':[
				{
					'name':'rgb-led0',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #0 in RGB. Min 0, max 255. Green is [0,255,0].'
				},
				{
					'name':'rgb-led1',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #1 in RGB. Min 0, max 255.'
				},
				{
					'name':'binary-led0',
					'timestamp':startTime,
					'value':true,
					'unit':'intensity',
					'type':'boolean',
					'description':'Setting of binary LED #0. True for led on, false for led off.'
				}
			]
		},		
		'gpio':{
			'name':'GPIOs',
			'description':'Raw access to GPIO ports on the Pi',
			'properties':[
				{
					'name':'gpio1',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #0 in RGB. Min 0, max 255. Green is [0,255,0].'
				},
				{
					'name':'rgb-led1',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #1 in RGB. Min 0, max 255.'
				},
				{
					'name':'binary-led0',
					'timestamp':startTime,
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
		},
		'images':{
			'name':'The video stream'
		}
	}
}



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
			res.render('actuators', {deviceId: req.params.id, names: Object.keys(actuators[req.params.id]), device: devices[req.params.id], actuators: actuators[req.params.id]});
		},

		json: function(){
			res.set({'Content-Length': '123','ETag': '12345'}).json(actuators[req.params.id]);	    
		}
	});	

	console.log('Request (%s %s)', req.method, req.url)
})

// GET on actuators of a device
app.get('/:id/actuators/:type/:property?', function (req, res) {

    if (property = req.params.property){ // if there's a property given
    	console.log('Reading property (%s %s)', req.method, req.url)
    	
    	if (actuators[req.params.id][req.params.type]['properties'][property]){ // if prop exists    		
			res.format({ 
				html: function(){
					res.render('actuator', {device: devices[req.params.id], actuator: actuators[req.params.id][req.params.type]});
				},

				json: function(){
					res.json(actuators[req.params.id][req.params.type]['properties'][property]);	    
				}
			});	
    	} else { // Property doesn't exist
    		// return some error or shit
			result = {'error':'Sorry, this property does not exist.'}
			res.status(404).json(result);
    	}
    } else { // no property given, just return the actuators object
    	console.log('Reading actuator (%s %s)', req.method, req.url)
		res.format({
			html: function(){
				res.render('actuator', {device: devices[req.params.id], actuator: actuators[req.params.id][req.params.type], properties: Object.keys(actuators[req.params.id][req.params.type]['properties'])});
			},

			json: function(){
				res.json(actuators[req.params.id][req.params.type]);	    
			}
		});	
    }

	console.log('Request (%s %s)', req.method, req.url)
})




/*------------------- NOT USED YET -------------------*/

// accept GET on subscriptions - NOT used
app.get('/:id/subscriptions', function (req, res) {
	res.json(actuators);
	console.log('Request (%s %s)', req.method, req.url)
})

// Id of the message to display as an infinte counter - till we reset the server ;)
messageId = 2;

// An array to hold the messages - ideally should be stored in the main json object
var lcdBuffer = [{id:0,content:'First text'},{id:1,content:'Second text'}];



// accept POST on all actuators
app.post('/:id/actuators/:type/:property', function (req, res) {

	// Parse the request parameters
	var deviceId = req.params.id, type = req.params.type, property = req.params.property; 

	var result; // Response to the request

	if (actuators[deviceId][type]['properties'][property]) { // If property exists
		if (actuators[deviceId][type]['properties'][property]['read-only']){ // If property is read-only
			result = {'error':'Sorry, this property is read-only.'}
			res.status(403).json(result);
		} else {
			// check if buffered, then write it

			// TODO implement support for other actuators in a similar way - this is obviously mega custom

			if (property == 'content'){
				console.log(req.body);
				lcdBuffer.push({id:messageId++,content:req.body.value});		
				result = {'message-received': req.body.value, 'id':messageId,'display-in-seconds':actuators.pi.display.properties.duration.value * lcdBuffer.length/1000};
			}
		
			res.status(202).json(result); // Accepted, not sure we'll act though
		}
	} else { // Property doesn't exist
		result = {'error':'Sorry, this property does not exist.'}
		res.status(404).json(result);
	}	
	console.log('Request (%s %s) \n%s', req.method, req.url,JSON.stringify(req.body,null,4))
})




// We setup a timed function that displays some text from the buffer
setInterval(function() {
	if (lcdBuffer.length > 0){ // Do we have stuff to write on the display?
		message = lcdBuffer.shift()
		// update the property object
		actuators.pi.display.properties.content.timestamp = new Date();
		actuators.pi.display.properties.content.value = message.content;
		console.log('Updating display text to: ' + message.content + ' (message id = ' + message.id + ' )');
		// Push the command to the device/lcd
	} else { // the buffer is empty - so do nothing (just keeps the last message displayed)		
		//console.log('No more text to display. Send data over!')
	}

}, actuators.pi.display.properties.duration.value);


// We now start the server
var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Your WoT device is running at http://%s:%s', addresses[0], port)
})


// W3C Standard Websocket Server for temperature
var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
	var url = ws.upgradeReq.url;
	var selected = null;
	console.log(url);
	if(url.indexOf('temperature') !== -1) {
		console.log('Temperature selected!');
		selected = sensors['pi']['temperature'];
	} else if (url.indexOf('pir') !== -1) {
		console.log('Pir selected!');
		selected = sensors['pi']['pir'];
	}

	// Send update every second
	// TODO: replace with actual updates from sensor
	var id = setInterval(function() {
		ws.send(JSON.stringify(selected), function() {});
	}, 5000);
	console.log('Started client interval...');
	ws.on('close', function() {
		console.log('Stopping client interval!');
		clearInterval(id);
	});
});