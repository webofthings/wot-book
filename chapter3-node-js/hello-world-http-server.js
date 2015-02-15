var http = require("http");
http.createServer(function(req,res){ 
	res.writeHeader(200, {'Content-Type': 'text/plain'});  
	res.end('Hello World');  
}).listen(8585); 
console.log('Server started!');