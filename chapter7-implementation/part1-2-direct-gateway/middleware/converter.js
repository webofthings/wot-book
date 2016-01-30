var msgpack = require('msgpack5')(),
  encode = msgpack.encode, //#A
  json2html = require('node-json2html');

module.exports = function() {
  return function (req, res, next) {
    console.info('Representation converter middleware called!');

    if (req.result) { //#B
      if (req.accepts('json')) { //#C
        console.info('JSON representation selected!');
        res.send(req.result);
        return;
      }

      if (req.accepts('html')) {
        console.info('HTML representation selected!');
        var transform = {'tag': 'div', 'html': '${name} : ${value}'};
        res.send(json2html.transform(req.result, transform)); //#D
        return;
      }

      if (req.accepts('application/x-msgpack')) {
        console.info('MessagePack representation selected!');
        res.type('application/x-msgpack');
        res.send(encode(req.result)); //#E
        return;
      }

      console.info('Defaulting to JSON representation!');
      res.send(req.result); //#F
      return;

    }
    else {
      next(); //#G
    }
  }
};
//#A Require the two modules and instantiate a MessagePack encoder
//#B Check if the previous middleware left a result for you in req.result
//#C Read the request header and check if the client requested HTML
//#D If HTML was requested, use json2html to transform the JSON into simple HTML
//#E Encode the JSON result into MessagePack using the encoder and return the result to the client
//#F For all other formats, default to JSON
//#G If no result was present in req.result, there’s not much you can do, so call the next middleware
