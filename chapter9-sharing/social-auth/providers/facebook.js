var passport = require('passport'),
  util = require('util'),
  FacebookStrategy = require('passport-facebook').Strategy,
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  auth = require('../middleware/auth'),
  methodOverride = require('method-override');

var acl = require('../config/acl.json'); //#A
var facebookAppId = '446871648832920'; //#A
var facebookAppSecret = '7499c233a1e2c4d8234dedca5e6a0cc3'; //#A
var socialNetworkName = 'facebook'; //#A
var callbackResource = '/auth/facebook/callback'; //#A
var callbackUrl = 'https://localhost:' + acl.config.sourcePort + callbackResource; //#A


module.exports.setupFacebookAuth = setupFacebookAuth;
function setupFacebookAuth(app) {
  app.use(cookieParser());
  app.use(methodOverride());
  app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));
  app.use(passport.initialize()); //#B
  app.use(passport.session());

  passport.serializeUser(function (user, done) { //#C
    done(null, user);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.use(new FacebookStrategy({
        clientID: facebookAppId, //#D
        clientSecret: facebookAppSecret,
        callbackURL: callbackUrl //#E
      },
      function (accessToken, refreshToken, profile, done) {

        auth.checkUser(socialId(profile.id), accessToken, function (err, res) { //#F
          if (err) return done(err, null);
          else return done(null, profile);
        });
      }));

  app.get('/auth/facebook',
    passport.authenticate('facebook'), //#G
    function (req, res) {}); //#H

  app.get(callbackResource, //#I
    passport.authenticate('facebook', {session: true, failureRedirect: '/login'}),
    function (req, res) {
      res.redirect('/account');
    });

  app.get('/account', ensureAuthenticated, function (req, res) { //#J
    auth.getToken(socialId(req.user.id), function (err, user) {
      if (err) res.redirect('/login');
      else {
        req.user.token = user.token;
        res.render('account', {user: req.user});
      }
    });
  });

  function socialId(userId) { //#K
    return socialNetworkName + ':' + userId;
  };

  app.get('/', ensureAuthenticated, function (req, res) {
    res.render('index', {user: req.user});
  });

  app.get('/login', function (req, res) {
    res.render('login', {user: req.user});
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  function ensureAuthenticated(req, res, next) { //#
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };

};

//#A Configuration variables: FB app ID, app secret, name, and the URL to call back after a user authentication on Facebook
//#B This will intilialize Passport and support storing the user login in sessions
//#C If we had a database of users we would use these two methods to load, respectively save users.
//#D These are the credentials uses to authenticate our Auth Proxy as a Facebook App.
//#E This URL will be called by Facebook after a successful login
//#F This is the 'verify' function, which is called by the framework after a successful authentication with provider (Facebook), here we check if the user is known by the proxy and store his token if it is the case
//#G This will trigger the authentication process, this will redirect the user to facebook.com
//#H Then facebook.com will redirect the user back to the callbackUrl we specified before so this function will never be called!
//#I This route will be called by Facebook after user authentication. If it failed we redirect to /login otherwise to /account
//#J if the user is authenticated we get his token and display his account page, otherwise: redirect to /login
//#K A unique social identifier is formed by concatenating the social userId and the social network name

