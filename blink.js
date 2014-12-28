var gpio = require("pi-gpio");

on();

function off() {
	console.log('On!');
    gpio.open(16, "output", function(err) {     
	    gpio.write(16, 0, function() {          
	        gpio.close(16);
	        setTimeout(function() {
    			on();
			}, 2000);                        
	    });
	});
}

function on() {
	console.log('Off!');
    gpio.open(16, "output", function(err) {     
	    gpio.write(16, 1, function() {          
	        gpio.close(16);
	        setTimeout(function() {
    			off();
			}, 2000);                     
	    });
	});
}