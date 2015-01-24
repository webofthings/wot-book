var Gpio = require('onoff').Gpio,
    sensor = new Gpio(17, 'in');

sensor.watch(function(err, value) {
    if (err) exit(err);
    console.log("Change detected:" + value);
});

function exit(err) {
	if(err) console.log('An error occured:' + err);
    sensor.unexport();
    console.log('Bye, bye!')
	process.exit(); 
}

process.on('SIGINT', exit);