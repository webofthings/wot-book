var gpio = require("pi-gpio");

inPin = 11;
readProximity();

function readProximity() {
	gpio.read(inPin, function(err, value) {
    	if(err) exit(err);
    	console.log(value ? 'some one!' : 'no one!');
		readProximity();
	});
}

function exit(err) {
	gpio.close(inPin);
	if(err) console.log('An error occured:' + err);
	console.log('Bye, bye!')
	process.exit(); 
}

process.on('SIGINT', exit);  
