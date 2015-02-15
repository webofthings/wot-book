var http = require("http"),
	request = require('request'),
	fs = require('fs');


var location = 'London, GB';
var piRootUrl = 'http://localhost:3000/pi/';
var name = 'Dom'

http.createServer(function(webReq, webResp){  

	// 1) Get Yahoo Weather
	request({
    		url: prepareYahooWeatherUrl(location),
    		json: true}, function (err, resp, yahooResult) {
			if (!err && resp.statusCode == 200) {

	    		console.log(yahooResult);
	    		var localTemp = yahooResult.query.results.channel.item.condition.temp;
	      		console.log('Local @ ' + location + ': ' + localTemp);

      		// 2) Call the Pi
			request({
	    			url: piRootUrl + 'sensors/temperature',
	    			json: true}, function (err, resp, piResult) {
							if (!err && resp.statusCode == 200) {

			    			console.log(piResult);
			    			var piTemp = piResult.value;
		        			console.log('Pi @ London: ' + piTemp);

		        			// 3) Compare and log
							var message = prepareMessage(name, location, localTemp, piTemp);
							fs.appendFile('log.txt', message, encoding='utf8', function (err) {
    							if (err) throw err;							
								webResp.writeHeader(200, {"Content-Type": "text/plain"});  
								webResp.write(message);  
								webResp.end();  
							});
		        		}
	        		});
		}
    });

}).listen(8080); 

function prepareYahooWeatherUrl(location) {
	return "https://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "') and u='c'&format=json";
}

function prepareMessage(name, location, localTemp, piTemp) {
    var diff = localTemp - piTemp;
    var qualifier = ' higher '; 
    if(diff < 0) {
      qualifier = ' lower '; 
    }
    var result = 'Hello I\'m ' + name + ' from ' + location;
    result += ' my local temperature is '  + Math.abs(diff) + ' degrees';
    result += qualifier + 'than yours!';
    return result;
  }

