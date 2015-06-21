/* var httpServer = require('./servers/http'),
 wsServer = require('./servers/websockets'),
 resources = require('./resources/model');

 // Plugins
 var ledsPlugin = require('./plugins/ledsPlugin');
 var pirPlugin = require('./plugins/pirPlugin');

 pirPlugin.start({'simulate': true, 'frequency' : 2000});
 ledsPlugin.start({'simulate': true, 'frequency' : 1000});

 // With WebSockets
 // HTTP Server
 var server = httpServer.listen(resources.port, function () {
 console.log('HTTP server started...');

 // Websockets server
 wsServer.listen(server);
 console.info('Your WoT Pi is up and running on port %s', resources.port);
 })
*/

 //Initial version:
 var httpServer = require('./servers/http'), //#A
 resources = require('./resources/model');

 var server = httpServer.listen(resources.port, function () { //#B
 console.info('Your WoT Pi is up and running on port %s', resources.port); //#C
 });

 //#A Load the http server and the model
 //#B Start the HTTP server by invoking listen() on the Express application
 //#C Once the server is started the callback is invoked

