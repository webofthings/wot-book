var WebSocketServer = require('ws').Server,
  resources = require('./../resources/model');

exports.listen = function(server) {
  var wss = new WebSocketServer({server: server});
  console.log('WebSocket server started...');
  wss.on('connection', function (ws) {
    var url = ws.upgradeReq.url;
    console.info(url);
      Object.observe(selectResouce(url), function (changes) {
        ws.send(JSON.stringify(changes[0].object), function () {
        });
      });
  });
};

function selectResouce(url) {
  var parts = url.split('/');
  parts.shift();
  var result = resources;
  for (var i = 0; i < parts.length; i++) {
    result = result[parts[i]];
  }
  return result;
}