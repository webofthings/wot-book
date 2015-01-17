var gpio = require("pi-gpio");

var inPin = 7;

blink(1);

function blink(status) {
	console.log('GPIO set to: ' + status);
    gpio.open(inPin, "output", function(err) {     
	    gpio.write(inPin, status, function() {          
	        gpio.close(inPin);
	        setTimeout(function() {
	        	status = (status + 1) % 2;
    			blink(status);
			}, 2000);                        
	    });
	});
}

process.on('SIGINT', function() {
    console.log('Caught interrupt signal, turning LED off!');
    gpio.write(inPin, 0, function() {          
	    gpio.close(inPin);
	    process.exit(); 
	}   
});