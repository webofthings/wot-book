var gpio = require("pi-gpio");

var inPin = 7;
var status = 1;

function blink() {
	status = (status + 1) % 2;
	console.log(status);
    gpio.open(inPin, "output", function(err) {     
	    gpio.write(inPin, status, function() {          
	        gpio.close(inPin);
	        setTimeout(function() {
    			blink();
			}, 2000);                        
	    });
	});
}