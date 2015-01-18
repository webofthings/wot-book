var gpio = require("pi-gpio");

readProximity(11);

function readProximity(inPin) {
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