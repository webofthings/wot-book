var gpio = require("pi-gpio");

readProximity(11);

function readProximity(inPin) {
	gpio.read(inPin, function(err, value) {
    	if(err) exit(err);
    	console.log(value ? 'some one!' : 'no one!');
		readProximity();
	});
}

function exit(err) {
	gpio.close(inPin);
	if(err) console.log('Error:' + err);
	console.log('Bye, bye!')
	process.exit(); 
}

process.on('SIGINT', exit);  
