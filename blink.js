var gpio = require("pi-gpio");

var outPin = 7;

blink(1, 2000);

function blink(status, frequency) {
	console.log('GPIO set to: ' + status);
    gpio.open(outPin, "output", function(err) {     
	    gpio.write(outPin, status, function() {          
	        gpio.close(outPin);
	        setTimeout(function() {
	        	status = (status + 1) % 2;
    			blink(status);
			}, frequency);                        
	    });
	});
}

process.on('SIGINT', function() {
    gpio.write(outPin, 0, function() {          
	    gpio.close(outPin);
	    console.log('Bye, bye!')
	    process.exit(); 
	});   
});