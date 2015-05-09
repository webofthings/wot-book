var http = require("http"); //#A
http.createServer(function(req,res){ //#B
  res.writeHeader(200, {'Content-Type': 'text/plain'}); //#C
  res.end('Hello World');
}).listen(8585); //#D
console.log('Server started!');

//#A “require” is used to “import” libraries
//#B creates a new HTTP server and pass it a function to be called whenever a client sends a request
//#C we start writing a response, beginning with the HTTP headers
//#D starts the HTTP server on port 8585
