var coap = require('coap');

coap.createServer(function(req, res) {
  console.info('Got a CoAP request for %s', req.url);

  if (req.headers['Accept'] != 'application/json') {
    res.code = '4.06';
    return res.end();
  }

  res.setOption('Content-Format', 'application/json');
  res.code = '2.05';
  var result = { temp: 0 };
  result.temp = random(0, 40);
  res.end(JSON.stringify(result));

}).listen(5683)

function random(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}
