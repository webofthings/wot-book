var msgpack = require('msgpack5')(),
  encode = msgpack.encode, //#A
  json2html = require('node-json2html');

function represent(req, res, next) {
  console.info('Representation converter middleware called!')
  if (req.result) { //#B
    if (req.accepts('html')) { //#C
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
    console.info('JSON representation selected!');
    res.send(req.result); //#F
    return;
  }
  else {
    next(); //#G
  }
}
module.exports = represent;

//#A Require the two modules and instantiate a MessagePack encoder
//#B We check if the previous middleware left a result for us in res.result
//#C Read the request header and check if the client requested HTML
//#D If HTML was requested we use the json2html to transform the JSON into a very simple HTML
//#E For MessagePack we encode the JSON result into MessagePack using the encoder and return the result to the client
//#F For all other formats we default to JSON
//#G If no result was present in res.result there is not much we can do and call the next middleware