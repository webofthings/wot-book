var mqtt = require('mqtt');

var config = require('./config.json'); 
var thngId=config.thngId; 
var thngUrl='/thngs/'+thngId;
var thngApiKey=config.thngApiKey; 


var status=false; // This is the status of this plug, true = turned on

// FIXME: use secure version here
var client = mqtt.connect("mqtt://mqtt.evrythng.com:1883", {
  username: 'authorization',
  password: thngApiKey 
});

client.on('connect', function () {

  client.subscribe(thngUrl+'/properties/');
  client.subscribe(thngUrl+'/actions/all'); // #A

  updateProperty ('livenow',true);

  setTimeout(updateProperties, 5000); 
});

client.on('message', function (topic, message) {
  if (topic.split('/')[1] == "thngs"){ // #B
    if (topic.split('/')[2] == thngId){  // #C
      if (topic.split('/')[3] == "properties"){ //#D 
        var property = JSON.parse(message);
        console.log('Property was updated: '+property[0].key+'='+property[0].value); 
      } else if (topic.split('/')[3] == "actions"){ //#E
        var action = JSON.parse(message);
        handleAction(action); 
      }
    }
  }
});

function handleAction (action) {
  switch(action.type) { // #F
    case '_setStatus':
      console.log('ACTION: _setStatus changed to: '+action.customFields.status); // #G
      // Set status and update the property to false
      status=Boolean(action.customFields.status);
      client.publish(thngUrl+'/properties/status', '[{"value": '+status+'}]');
      /* Do something about this */
      break;
    case '_setLevel':
      console.log('ACTION: _setLevel changed to: '+action.customFields.level);
      break;
    default:
      console.log('ACTION: Unknown action type: '+action.type);
      break;
  }
}

//#A Let's also subscribe to all actions on this thing
//#B Verify if the MQTT message is on a 'thng' 
//#C Verify if the message is for the current thng
//#D Check if a property was changed, if so display it
//#E Was it an action? If so call handleAction()
//#F Check the type of this action
//#G If action type is set status, display the new value and do something with it

function updateProperties () {
  var voltage = (219.5 + Math.random()).toFixed(3); // #H
  updateProperty ('voltage',voltage);

  var current = (Math.random()*10).toFixed(3); // #I
  if (status==false) current = 0.001;
  updateProperty ('current',current);

  var power = (voltage * current * (0.6+Math.random()/10)).toFixed(3) // #J
  updateProperty ('power',power);

	setTimeout(updateProperties, 5000); // #F
}

function updateProperty (property,value) {
  // update the model
  client.publish(thngUrl+'/properties/'+property, '[{"value": '+value+'}]');
}

process.on('SIGINT', function() { 
  updateProperty ('livenow',false);
	client.end();
  process.exit();
});