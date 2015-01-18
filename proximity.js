var gpio = require("pi-gpio");

var inPin = 11;

gpio.open(inPin, "input", function(err) {     
	gpio.read(pin, function(err, value) {
    	if(err) throw err;
    	readProximity(readProximity);
	});
});

function readProximity(callback) {
	gpio.read(inPin, function(err, value) {
    	if(err) throw err;
    	console.log(value);
		callback();
	});
}

process.on('SIGINT', function() {        
	gpio.close(inPin);
	console.log('Bye, bye!')
	process.exit(); 
});   