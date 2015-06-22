var coap = require('coap'),
  bl = require('bl');

coap
  .request({
    pathname: '/temp',
    options: { 'Accept' : 'application/json'}
  })
  .on('response', function(res) {
    console.log('response code', res.code);
    if (res.code !== '2.05')
      return process.exit(1);

    res.pipe(bl(function(err, data) {
      var json = JSON.parse(data);
      console.log(json);
      process.exit(0)
    }))
  })
  .end();