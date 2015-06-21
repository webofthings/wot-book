var mqtt = require('mqtt');

var config = require('./config.json'); // #A 
var thngId=config.thngId; //Your THNG ID
var thngUrl='/thngs/'+thngId;
var thngApiKey=config.thngApiKey; //Your device API KEY

console.log('Using Thng #'+thngId+' with API Key: '+ thngApiKey);

// This is using the unsecure version - for simplicity's sake - obviously, don't use it in production
var client = mqtt.connect("mqtt://mqtt.evrythng.com:1883", {// #B
  username: 'authorization',
  password: thngApiKey 
});

client.on('connect', function () { // #C
  client.subscribe(thngUrl+'/properties/'); //#D

  client.publish(thngUrl+'/properties/livenow', '[{"value": true}]'); //#E
  setTimeout(updateProperties, 5000); //#F
});

client.on('message', function (topic, message) { // #G
  console.log(message.toString());
});


function updateProperties () {
  var voltage = (219.5 + Math.random()).toFixed(3); // #H
	client.publish(thngUrl+'/properties/voltage', '[{"value": '+voltage+'}]');

  var current = (Math.random()*10).toFixed(3); // #I
  client.publish(thngUrl+'/properties/current', '[{"value": '+current+'}]');

  var power = (voltage * current * (0.6+Math.random()/10)).toFixed(3) // #J
  client.publish(thngUrl+'/properties/power', '[{"value": '+power+'}]');

	setTimeout(updateProperties, 5000); // #F
}

// Let's close this connection cleanly
process.on('SIGINT', function() { // #K
	client.publish(thngUrl+'/properties/livenow', '[{"value": false}]');
	client.end();
  process.exit();
});

//#A Load configuration from file (thng id and thng API Key)
//#B Connects to the MQTT server on EVRYTHNG
//#C Callback called once when the MQTT connection suceeded
//#D Subscribe to All Properties
//#E Set the property 'live' to true
//#F Call the function updateProperties() in 5 seconds
//#G Called every time an MQTT message is received from the broker
//#H 'Measures' voltage (fluctuates around ~220 volts)
//#I 'Measures' current (fluctuates between 0-10 ampères)
//#J 'Measures' power using P=U*I*PF (PF=power factor fluctuates between 60-70%)
//#K Cleanly exits this code (and sets the 'livenow' property to false)