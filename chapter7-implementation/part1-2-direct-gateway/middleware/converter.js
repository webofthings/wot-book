var msgpack = require('msgpack5')(),
  encode = msgpack.encode, //#A
  json2html = require('node-json2html');

module.exports = function () { //#B
  return function (req, res, next) {
    console.info('Representation converter middleware called!');
    if (req.result) { //#C
      switch (req.accepts(['json', 'html', 'application/x-msgpack'])) { //#D
        case 'html':
          console.info('HTML representation selected!');
          var transform = {'tag': 'div', 'html': '${name} : ${value}'};
          res.send(json2html.transform(req.result, transform)); //#E
          return;
        case 'application/x-msgpack':
          console.info('MessagePack representation selected!');
          res.type('application/x-msgpack');
          res.send(encode(req.result)); //#F
          return;
        default: //#G
          console.info('Defaulting to JSON representation!');
          res.send(req.result);
          return;
      }
    }
    else {
      next(); //#H
    }
  }
};
//#A Require the two modules and instantiate a MessagePack encoder
//#B In Express, a middleware is usually a function returning a function
//#C Check if the previous middleware left a result for you in req.result
//#D Get the best representation to serve from the Accept header
//#E If HTML was requested, use json2html to transform the JSON into simple HTML
//#F Encode the JSON result into MessagePack using the encoder and return the result to the client
//#G For all other formats, default to JSON
//#H If no result was present in req.result, there’s not much you can do, so call the next middleware
