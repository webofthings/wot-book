var gpio = require("pi-gpio");

gpio.open(7, "input", function(err) {     
	    gpio.read(7, function(err, value) {
    	if(err) throw err;
    		console.log(value); // The current state of the pin
		});
});
