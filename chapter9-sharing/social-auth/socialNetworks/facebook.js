var passport = require('passport'),
  util = require('util'),
  FacebookStrategy = require('passport-facebook').Strategy,
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  auth = require('../middleware/auth'),
  methodOverride = require('method-override'),
  config = require('../config/acl.json').config;

var acl = require('../config/acl.json');

var facebookAppId = '446871648832920';
var facebookAppSecret = '7499c233a1e2c4d8234dedca5e6a0cc3';
var socialNetworkName = 'facebook';
var port = 5050;
var callbackUrl = 'https://localhost:' + config.sourcePort + '/auth/facebook/callback';


module.exports.setupFacebookAuth = setupFacebookAuth;
function setupFacebookAuth(app) {
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
  passport.use(new FacebookStrategy({
        clientID: facebookAppId,
        clientSecret: facebookAppSecret,
        callbackURL: callbackUrl
      },
      function (accessToken, refreshToken, profile, done) {

        // Check if user is in ACL (via social network + userid)
        // Add token to entry in ACL
        auth.checkUser(socialId(profile.id), accessToken, function (err, res) {
          if (err) return done(err, null);
          else return done(null, profile);
        });
      })
  );

  app.use(cookieParser());
  app.use(methodOverride());
  app.use(session({secret: 'keyboard cat'}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', ensureAuthenticated, function (req, res) {
    res.render('index', {user: req.user});
  });

  app.get('/account', ensureAuthenticated, function (req, res) {
    auth.getToken(socialId(req.user.id), function (err, user) {
      if (err) res.redirect('/login');
      else {
        req.user.token = user.token;
        res.render('account', {user: req.user});
      }
    });
  });

  app.get('/login', function (req, res) {
    res.render('login', {user: req.user});
  });


// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
  app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function (req, res) {
      // The request will be redirected to Facebook for authentication, so this
      // function will not be called.
    });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {session: true, failureRedirect: '/login'}),
    function (req, res) {
      res.redirect('/account');
    });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };

  function socialId(userId) {
    return socialNetworkName + ':' + userId;
  };
};

