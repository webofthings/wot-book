var http = require("http");						//#A
http.createServer(function(req,res){ 				//#B
    res.writeHeader(200, {'Content-Type': 'text/plain'});  	//#C
    res.end('Hello World');
}).listen(8585); 							//#D
console.log('Server started!');
