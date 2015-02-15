var http = require("http");

var port = 8686;

// Returns a random integer between low and high
function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

http.createServer(function(req,res){ 
	console.log('New incoming client request for ' + req.url);

	// We start writing our response by giving it 200 (OK) and
	// informing the client we return JSON data
	res.writeHeader(200, {'Content-Type': 'application/json'});   
	switch(req.url) {
		// We look for a request on /temperature
		case '/temperature':
		// And return the corresponding JSON
		res.write('{"temperature" :' + randomInt(1, 40) + '}');  
		break;
		case '/light':
		res.write('{"light" :' + randomInt(1, 100) + '}');  
		break;
		default:
		res.write('{"hello" : "world"}');
	}
	res.end();  
}).listen(8686);
console.log('Server listening on http://localhost:' + port);
