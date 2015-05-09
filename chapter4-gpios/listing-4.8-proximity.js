var gpio = require("pi-gpio");

pin = 11;

function readProximity() {
  gpio.open(pin, "input", function (err) { //#A
    gpio.read(pin, function (err, value) { //#B
      if (err) exit(err);
      console.log(value ? 'there is some one!' : 'not anymore!'); //#C
      readProximity();
    });
  });
}

function exit(err) {
  gpio.close(pin);
  if (err) console.log('An error occurred: ' + err);
  console.log('Bye, bye!')
  process.exit();
}
process.on('SIGINT', exit);

readProximity();

// #A Open the GPIO pin in input mode
// #B Read the digital value (1 or 0) on the pin
// #C If the PIR sensor sees a warm body the value will be 1 otherwise it will be 0