var msgpack = require('msgpack5')(),
  encode = msgpack.encode,
  decode = msgpack.decode,
  json2html = require('node-json2html');

function represent(req, res, next) {
  //console.log(req.headers);

  if (req.result) {
    if (req.accepts('html')) {
      //TODO
      console.log('HTML representation selected!')
      //res.send(json2html.transform(req.result));
      res.send(req.result);
      return;
    }

    if (req.accepts('application/x-msgpack')) {
      console.log('MessagePack representation selected!');
      res.type('application/x-msgpack');
      res.send(encode(req.result));
      return;
    }

    // JSON is the default representation...
    console.log('JSON representation selected!');
    res.send(req.result);
    return;
  }
  else {
    // There is no result, let's go to the next middleware
    next();
  }
}

module.exports = represent;