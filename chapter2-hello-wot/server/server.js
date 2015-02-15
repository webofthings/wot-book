var express = require('express'),
cors = require('cors'),
app = express(),
cons = require('consolidate'),
http = require('http'),
mdns = require('mdns'),
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

// And this is the port for this server
var rootPort = 3000;



// Setup all the templating stuff
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// To parse the the body of incoming HTTP requests
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded --> to parse stuff received from forms using POST
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
	Device will need to have support for API keys
*/


// This is the gateway data structure.
var myself = {
	'name':'WoT Gateway @ EVRYTHNG',
	'ip' : addresses[0],
	'port': rootPort,
	'rootUrl':'http://'+addresses[0]+':'+rootPort+'/',
	'publicUrl':'https://devices.webofthings.io'
}


// The timestamp when the server was started.
startTime = new Date();//.toString();


// We need a master object to hold the list of all sensors, actuators, config of the device, etc.
var devices = {
	'pi':{
		'id':'1',
		'name':'My WoT Raspberry PI',
		'description':'A simple WoT-connected Raspberry PI for the WoT book.',
		'url':myself.rootUrl+'pi/',
		'version':'v0.1',
		'tags':['raspberry','pi','WoT'],
		'ip' : addresses[0],
		'resources':{
			'sensors':{
				'url':'sensors/',
				'name':'The list of sensors'
			},
			'actuators':{
				'url':'actuators/',
				'name':'The list of actuators'
			},
			'debug':{
				'url':'debug/',
				'name':'The debug channel'
			}
		},
		'links': {
			'meta': {
				'rel':'http://webofthings.io/meta/device/',
				'title':'Metadata'
			},
			'self': {
				'rel':'self/',
				'title':'Self'
			},
			'doc': {
				'rel':'http://webofthings.io/docs/pi/',
				'title':'Documentation'
			},
			'ui': {
				'rel':'ui/',
				'title':'User Interface'
			}
		}
	},
	'camera':{
		'id':'2',
		'name':'My WoT Camera',
		'description':'A simple WoT-connected camera.',
		'url':myself.rootUrl+'camera/',
		'version':'v0.1',
		'tags':['camera','WoT'],
		'ip' : addresses[0],
		'resources':{
			'sensors':{
				'url':'sensors/',
				'name':'The list of sensors'
			},
			'actuators':{
				'url':'actuators/',
				'name':'The list of actuators'
			},
			'debug':{
				'url':'debug/',
				'name':'The debug channel'
			}
		},
		'links': {
			'meta': {
				'rel':'http://webofthings.io/meta/device/',
				'title':'Metadata'
			},
			'doc': {
				'rel':'http://webofthings.io/docs/pi/',
				'title':'Documentation'
			},
			'ui': {
				'rel':'ui',
				'title':'User Interface'
			}
		}

	}
}


var sensors = {
	'pi': {
		'gpio':{
			'name':'General Purpose IO',
			'description':'The general-purpose input-output pins.'
		},
		'temperature':{
			'name':'Temperature Sensor',
			'description':'A temperature sensor.',
			'unit':'celsius',
			'value':22,
			'timestamp': startTime
		},
		'pir':{
			'name':'Passive Infrared',
			'description':'A passive infrared sensor. When true someone is present.',
			'type':'boolean',
			'value':true
		},
	},
	'camera':{
		'picture':{
			'name':'Camera Sensor',
			'url':'cam',
			'type':'image/jpg',
			'description':'Takes a still picture with the camera.'
		}
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
					'description':'Percentage of brightness of the display. Min is 0 which is black, max is 100 which is white.'
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
					'value':20000,
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
			'properties':{
				'rgbled0':{
					'name':'RGB Led 0',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #0 in RGB. Min 0, max 255. Green is [0,255,0].'
				},
				'rgbled1':{
					'name':'RGB Led 1',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Color setting of LED #1 in RGB. Min 0, max 255.'
				},
				'rgbled2':{
					'name':'RGB Led 2',
					'timestamp':startTime,
					'value':[255,100,10],
					'unit':'intensity',
					'type':['integer','integer','integer'],
					'description':'Setting of binary LED #0. True for led on, false for led off.'
				}
			}
		},		
		'gpio':{
			'name':'GPIOs',
			'description':'Raw access to GPIO ports on the Pi',
			'properties':{
				'gpio0':{
					'name':'GPIO 0',
					'timestamp':startTime,
					'value':true,
					'unit':'digital HIGH',
					'type':'boolean',
					'description':'Color setting of LED #0 in RGB. Min 0, max 255. Green is [0,255,0].'
				},
				'gpio1':{
					'name':'GPIO 1',
					'timestamp':startTime,
					'value':true,
					'unit':'digital HIGH',
					'type':'boolean',
					'description':'Color setting of LED #1 in RGB. Min 0, max 255.'
				},
				'gpio2':{
					'name':'GPIO 2',
					'timestamp':startTime,
					'value':true,
					'unit':'digital HIGH',
					'type':'boolean',
					'description':'Setting of binary LED #0. True for led on, false for led off.'
				}
			}
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



/* 
 ######   ######## ########          ## 
##    ##  ##          ##            ##  
##        ##          ##           ##   
##   #### ######      ##          ##    
##    ##  ##          ##         ##     
##    ##  ##          ##        ##      
 ######   ########    ##       ##       
*/


// GETs the list of all devices connected here
app.get('/', function (req, res) {
	
	/*
		These are links to be used for HATEOAS 
	*/

	var links = {
		'meta.rdf': {
			'rel':'meta',
			'title':'Metadata'
		},
		'self': {
			'rel':'self',
			'title':'Self'
		},
		'doc': {
			'rel':'doc',
			'title':'Documentation'
		},
		'ui': {
			'rel':'ui',
			'title':'User Interface'
		}
	};

	var headers = {'Link': '</meta.rdf>; rel="meta"','Link': '</self>; rel="self"','Link': '</things>; rel="things"','Link': '</doc>; rel="doc"','Link': '</ui>; rel="ui"'};

	res.format({
		html: function(){
			res.set(headers).render('index', {names: Object.keys(devices), devices: devices, linkNames: Object.keys(links), links:links, myself: myself });
		},

		json: function(){
			res.set(headers).json(devices);
		}
	});	

	console.log('Request (%s %s)', req.method, req.url);
})


// GETs documentation
app.get('/doc', function (req, res) { // Gets a specific device

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


// GETs self
app.get('/self', function (req, res) { // Gets a specific device

	res.format({
		html: function(){
			res.render('device', {deviceId: req.params.id, device: devices[req.params.id]});
		},

		json: function(){
			res.json(myself);
		}
	});	

  	//res.send('user' + req.params.id);

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
				lcdBuffer.push({id:messageId++,content:req.body.value});		
				result = {'message-received': req.body.value, 'id':messageId,'displayInSeconds':actuators.pi.display.properties.duration.value * lcdBuffer.length/1000};
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
		actuators.pi.display.properties.content.length = lcdBuffer.length;
		console.log('Updating display text to: ' + message.content + ' (message id = ' + message.id + ' )');
		// Push the command to the device/lcd
	} else { // the buffer is empty - so do nothing (just keeps the last message displayed)		
		//console.log('No more text to display. Send data over!')
	}

}, actuators.pi.display.properties.duration.value);


// We now start the server
var server = app.listen(rootPort, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Your WoT device is running at http://%s:%s', addresses[0], port)
})



// Let's create and expose an mDNS service 

// This holds infos about this Gateway - the "type:wot" means it's a WoT device and the rootPort has the "rootPort"
var txt_record = {
    name: 'here',
    type : 'wot',  
    public: true,
    rootPort: rootPort
};

var ad = mdns.createAdvertisement(mdns.tcp('http'), 4321, {txtRecord: txt_record});
ad.start();


// This is looking for other mDNS devices on the LAN (and maybe add them to the GW ;) 
var browser = mdns.createBrowser(mdns.tcp('http'));

browser.on('serviceUp', function(service) {
	if (service.txtRecord){ // hey, do we know anything about this dude?
		if (service.txtRecord.type=='wot'){ // we do, so is it a WoT device?
		  console.log("Found WoT Device: ", service);
		  // It is, so we now parse the data on the root device address+port
		}
	}
});

browser.on('serviceDown', function(service) {
	if (service.txtRecord.type=='wot'){ 
	  console.log("WoT Device is gone: ", service);
	}
});

browser.start();



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