var Gpio = require('onoff').Gpio,
    sensor = new Gpio(17, 'in');

sensor.watch(function(err, value) {
    if (err) exit();
    console.log("Change detected:" + value);
});

function exit() {
    sensor.unexport();
    process.exit();
}

process.on('SIGINT', exit);