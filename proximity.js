var gpio = require("pi-gpio");

gpio.close(12);
gpio.open(12, "input", function(err) {     
	    gpio.read(12, function(err, value) {
    	if(err) throw err;
    		console.log(value); // The current state of the pin
		});
		gpio.close(12);
});
