var coap = require('coap'),  //#A
  utils = require('./../utils/utils');

var port = 5683;

coap.createServer(function (req, res) {
  console.info('CoAP device got a request for %s', req.url);
  if (req.headers['Accept'] != 'application/json') {
    res.code = '4.06'; //#B
    return res.end();
  }
  switch (req.url) { //#C
    case "/co2":
      respond(res, {'co2': utils.randomInt(0, 1000)}); //#D
      break;
    case "/temp":
      respond(res, {'temp': utils.randomInt(0, 40)});
      break;
    default:
      respond(res);
  }
}).listen(port, function () {
  console.log("CoAP server started on port %s", port)
});//#E

function respond(res, content) { //#F
  if (content) {
    res.setOption('Content-Format', 'application/json');
    res.code = '2.05';
    res.end(JSON.stringify(content));
  } else {
    res.code = '4.04';
    res.end();
  }
};
//#A Require the Node.js CoAP module you installed
//#B You only serve JSON, so you reply with a 4.06 (= HTTP 406: Not acceptable)
//#C Handle the different resources requested
//#D This is the CO2 resource; generate a random value for it and respond
//#E Start the CoAP server on port 5683 (CoAP’s default port)
//#F Send the JSON content back or reply with a 4.04 (= HTTP 404: Not found)
