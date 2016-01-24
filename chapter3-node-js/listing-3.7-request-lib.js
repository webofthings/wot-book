var request = require('request');
request('http://webofthings.org', function (error, response, body) {  //#A
  if (!error && response.statusCode === 200) {
    console.log(body); //#B
  }
});

//#A This is an anonymous callback that will be invoked when the request library did fetch the webofthings homepage from the Web
//#B This will display the HTML code of the page
