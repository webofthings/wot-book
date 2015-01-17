var gpio = require("pi-gpio");

var inPin = 7;
var status = 1;
blink();

function blink() {
	console.log(status);
    gpio.open(inPin, "output", function(err) {     
	    gpio.write(inPin, status, function() {          
	        gpio.close(inPin);
	        setTimeout(function() {
	        	status = (status + 1) % 2;
    			blink();
			}, 2000);                        
	    });
	});
}