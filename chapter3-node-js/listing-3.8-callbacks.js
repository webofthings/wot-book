var http = require('http'),
  request = require('request'),
  fs = require('fs');

var port = 8787;
var serviceRootUrl = 'http://localhost:8686';


http.createServer(function (servReq, servResp) {
  console.log('New incoming client request...');
  if (servReq.url === '/log') {
    request({url: serviceRootUrl + '/temperature', json: true},  //#A
      function (err, resp, body) {
        if (err) throw err;
        if (resp.statusCode === 200) {
          console.log(body);
          var temperature = body.temperature;

          request({url: serviceRootUrl + '/light', json: true}, //#B
            function (err, resp, body) {
              if (err) throw err;
              if (resp.statusCode === 200) {
                console.log(body);
                var light = body.light;
                var logEntry = 'Temperature: ' + temperature + ' Light: ' + light;
                fs.appendFile('log.txt', logEntry + '\n', encoding = 'utf8', function (err) { //#C
                  if (err) throw err;
                  servResp.writeHeader(200, {"Content-Type": "text/plain"});
                  servResp.write(logEntry);
                  servResp.end();
                });
              }
            });
        }
      });
  } else {
    servResp.writeHeader(200, {"Content-Type": "text/plain"});
    servResp.write('Please use /log');
    servResp.end();
  }

}).listen(port);
console.log('Server listening on http://localhost:' + port);
