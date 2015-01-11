var gpio = require("pi-gpio");

var pin = 11;

// Start reading from stdin so we don't exit.
process.stdin.resume();

process.on('SIGINT', function () {
	gpio.close(pin);
	console.log('Closing GPIO...  Press Control-D to exit.');
});

gpio.open(pin, "input", function(err) {     
	gpio.read(pin, function(err, value) {
    	if(err) throw err;
    	readProximity();
	});
});


function readProximity() {
	gpio.read(pin, function(err, value) {
    	if(err) throw err;
    	console.log(value); // The current state of the pin
		readProximity();
	});
}
