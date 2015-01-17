var gpio = require("pi-gpio");

var inPin = 7;
on();

function off() {
	console.log('Off!');
    gpio.open(inPin, "output", function(err) {     
	    gpio.write(inPin, 0, function() {          
	        gpio.close(inPin);
	        setTimeout(function() {
    			on();
			}, 2000);                        
	    });
	});
}

function on() {
	console.log('On!');
    gpio.open(inPin, "output", function(err) {     
	    gpio.write(inPin, 1, function() {          
	        gpio.close(inPin);
	        setTimeout(function() {
    			off();
			}, 2000);                     
	    });
	});
}