var ds18b20 = require('ds18b20');
ds18b20.sensors(function(err, ids) {
  // got sensor IDs ...
});

// ...

ds18b20.temperature('10-00080283a977', function(err, value) {
  console.log('Current temperature is', value);
});