var gpio = require("pi-gpio");

var inPin = 11;

gpio.open(inPin, "input", function(err) {     
	gpio.read(inPin, function(err, value) {
    	if (err) exit();
    	readProximity();
	});
});

function readProximity() {
	gpio.read(inPin, function(err, value) {
    	if(err) exit();
    	console.log(value ? 'some one!' : 'no one!');
		readProximity();
	});
}

function exit() {
	gpio.close(inPin);
	console.log('Bye, bye!')
	process.exit(); 
}

process.on('SIGINT', exit);  