var httpServer = require('./servers/http'),
  resources = require('./resources/config');

httpServer.listen(resources.port);