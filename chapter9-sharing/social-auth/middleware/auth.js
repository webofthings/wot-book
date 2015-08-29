var acl = require('../config/acl.json'),
  https = require('https'),
  fs = require('fs');

exports.socialTokenAuth = function (req, res, next) {
  console.log(req.method + " " + req.path);
  if (isOpen(req.path)) {
    next();
  } else {
    var token = req.body.token || req.param('token') || req.headers['Authorization'];
    if (!token) {
      return res.status(401).send({success: false, message: 'API token missing.'});
    } else {
      checkUserAcl(token, req.path, function (err, user) {
        if (err) {
          return res.status(403).send({success: false, message: err});
        }
        next();
      });
    }
  }
};

exports.checkUser = checkUser;
function checkUser(socialUserId, token, callback) {
  var result = findInAcl(function(current) {
    return current.uid === socialUserId;
  });
  if(result) {
    // Add token for this user
    result.token = token;
    callback(null, result);
  } else {
    callback('User not found!', null);
  }
};

exports.getToken = getToken;
function getToken(socialUserId, callback) {
  var result = findInAcl(function(current) {
    return current.uid === socialUserId;
  });
  if(result) {
    callback(null, result);
  } else {
    callback('User not found!', null);
  }
};

function checkUserAcl(token, path, callback) {
  var userAcl = findInAcl(function (current) {
    return current.token === token && current.resources.indexOf(path) !== -1;
  });
  if (userAcl) {
    callback(null, userAcl);
  } else {
    callback('Not authorized for this resource!', null);
  }
};

function isOpen(path) {
  // Access to any CSS is open...
  if (path.substring(0, 5) === "/css/") return true;

  // Is the path an open path?
  if (acl.open.indexOf(path) !== -1) return true;
}

function findInAcl(filter) {
  return acl.protected.filter(filter)[0];
};