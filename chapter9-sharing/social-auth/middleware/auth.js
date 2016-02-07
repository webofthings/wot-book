var acl = require('../config/acl.json'), //#A
  https = require('https'),
  fs = require('fs');

exports.socialTokenAuth = function () {
  return function (req, res, next) {
    if (isOpen(req.path)) { //#B
      next();
    } else {
      var token = req.body.token || req.get('authorization') || req.query.token;
      if (!token) {
        return res.status(401).send({success: false, message: 'API token missing.'});
      } else {
        checkUserAcl(token, req.path, function (err, user) { //#C
          if (err) {
            return res.status(403).send({success: false, message: err}); //#D
          }
          next(); //#E
        });
      }
    }
  }
};

function checkUserAcl(token, path, callback) { //#F
  var userAcl = findInAcl(function (current) {
    return current.token === token && current.resources.indexOf(path) !== -1;
  });
  if (userAcl) {
    callback(null, userAcl);
  } else {
    callback('Not authorized for this resource!', null);
  }
};
function findInAcl(filter) {
  return acl.protected.filter(filter)[0];
};


function isOpen(path) { //#G
  // Access to any CSS is open...
  if (path.substring(0, 5) === "/css/") return true;

  // Is the path an open path?
  if (acl.open.indexOf(path) !== -1) return true;
}

exports.checkUser = checkUser;
function checkUser(socialUserId, token, callback) { //#H
  var result = findInAcl(function (current) {
    return current.uid === socialUserId; //#I
  });
  if (result) {
    result.token = token; //#J
    callback(null, result);
  } else {
    callback('User <b>' + socialUserId + '</b> not found! Did you add it to acl.json?', null);
  }
};

exports.getToken = getToken;
function getToken(socialUserId, callback) {
  var result = findInAcl(function (current) {
    return current.uid === socialUserId;
  });
  if (result) {
    callback(null, result);
  } else {
    callback('User <b>' + socialUserId + '</b> not found! Did you add it to acl.json?', null);
  }
};


//#A Require your ACL config file
//#B If the request is for an open path, call the next middleware
//#C Otherwise, get the access token and check the ACL for this token
//#D If there’s an error, return a 403 Forbidden status code
//#E Otherwise, the user is good to go, and you call the next middleware
//#F Can we find a user with the given token and the given path, for example, /temp?
//#G Handle open resources
//#H Called by facebook.js when a user is authenticated
//#I If the user ID you got from Facebook is present in your ACL, you have a winner!
//#J Store the user token to allow them to make subsequent calls to resources they can access
