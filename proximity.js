var gpio = require("pi-gpio");

var inPin = 11;

gpio.open(inPin, "input", function(err) {     
	gpio.read(inPin, function(err, value) {
    	if(err) throw err;
    	readProximity();
	});
});

function readProximity() {
	gpio.read(inPin, function(err, value) {
    	if(err) throw err;
    	console.log(value ? 'no one!' : 'some one!');
		readProximity();
	});
}

process.on('SIGINT', function() {        
	gpio.close(inPin);
	console.log('Bye, bye!')
	process.exit(); 
});   