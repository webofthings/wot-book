var gpio = require("pi-gpio");

var pin = 11;

gpio.open(pin, "input", function(err) {     
	gpio.read(pin, function(err, value) {
    	if(err) throw err;
    	readProximity();
	});
});


function readProximity() {
	gpio.read(pin, function(err, value) {
    	if(err) throw err;
    	console.log(value);
		readProximity();
	});
}

function closeGpios() {
	gpio.close(pin);
}

process.on('SIGINT', closeGpios);