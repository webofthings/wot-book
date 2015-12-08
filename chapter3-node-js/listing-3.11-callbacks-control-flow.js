var http = require("http"),
  request = require('request'),
  fs = require('fs'),
  async = require('async');

var port = 8787;
var serviceRootUrl = 'http://localhost:8686';

http.createServer(function (req, res) {
  console.log('New incoming client request...');
  if (req.url === '/log') {
    async.series([  //#A
        function (callback) {
          request({url: serviceRootUrl + '/temperature', json: true}, function (err, res, body) {
            if (err) callback(err);
            if (res && res.statusCode === 200) {
              console.log(body);
              var temp = body.temperature;
              callback(null, temp); //#B
            } else callback(null, null);
          });
        },
        function (callback) {
          request({url: serviceRootUrl + '/light', json: true}, function (err, res, body) {
            if (err) callback(err);
            if (res && res.statusCode === 200) {
              console.log(body);
              var light = body.light;
              callback(null, light);
            } else callback(null, null);
          });
        }],
      function (err, results) { //#C
        console.log(results);   //#D
        var logEntry = 'Temperature: ' + results[0] + ' Light: ' + results[1];
        fs.appendFile('log.txt', logEntry + '\n', encoding = 'utf8', function (err) {
          if (err) throw err;
          res.writeHeader(200, {"Content-Type": "text/plain"});
          res.write(logEntry);
          res.end();
        });
      });

  } else {
    res.writeHeader(200, {"Content-Type": "text/plain"});
    res.write('Please use /log');
    res.end();
  }
}).listen(port);
console.log('Server listening on http://localhost:' + port);

//#A We create an array of functions to be invoked in series
//#B Call the next function in the series
//#C This function is called when the last function in the series returned
//#D results is now equal to [light, temperature]
