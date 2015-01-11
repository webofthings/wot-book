var gpio = require("pi-gpio");

var pin = 11;

gpio.open(pin, "input", function(err) {     
	gpio.read(pin, function(err, value) {
    	if(err) throw err;
    	console.log(value); // The current state of the pin
		gpio.close(pin);
	});
});
