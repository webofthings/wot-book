var gpio = require("pi-gpio");

var inPin = 12;

gpio.open(inPin, "input", function(err) {     
	gpio.read(inPin, function(err, value) {
    	if(err) throw err;
    	readProximity();
	});
});

function readProximity() {
	gpio.read(inPin, function(err, value) {
    	if(err) throw err;
    	console.log(value);
		readProximity();
	});
}

process.on('SIGINT', function() {        
	gpio.close(inPin);
	console.log('Bye, bye!')
	process.exit(); 
});   