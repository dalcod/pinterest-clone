var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('./model/user');
var keys = require('./secretKeys');

/* ----------- Local Strategy ----------- */

passport.use('local-signup', new LocalStrategy(function(username, password, done){
    User.findOne({'local.username': username}, function(err, user){
        if (err) return done(err);
        if (user) {
            return done(null, false);
        } else {
            var newUser = new User();
            newUser.local.method = "local";
            newUser.local.username = username;
            newUser.local.password = newUser.generateHash(password);
            newUser.save(function(err){
                if (err) throw err;
                return done(null, newUser);
            });
        }
    });
}));

passport.use('local-login', new LocalStrategy(function(username, password, done){
    User.findOne({'local.username': username}, function(err, user){
        if (err) return done(err);
        if (!user) {
            return done(null, {invalid: 'username'});
        }
        if (!user.validPassword(password)) {
            return done(null, {invalid: 'password'});
        }
        return done(null, user);
    });
}));

/* ----------- Twitter Strategy ----------- */

var twitterAuth = {
    consumerKey: keys.twitter.consumerKey,
    consumerSecret: keys.twitter.consumerSecret,
    callbackUrl: 'https://pinterest-clone3.herokuapp.com/auth/twitter/callback'
}

passport.use(new TwitterStrategy(twitterAuth, function(token, tokenSecret, profile, done){
    User.findOne({'twitter.id': profile.id}, function(err, user){
        if (user) {
            done(null, user);
        } else {
            var newUser = new User(); 
            newUser.twitter.method = 'twitter';
            newUser.twitter.id= profile.id;
            newUser.twitter.username= profile.username;
            newUser.twitter.displayName= profile.displayName;
            newUser.twitter.token= token;
            newUser.twitter.photos= profile.photos;

            newUser.save(function(err){
                if (err) done(err);
                done(null, newUser)
            });
        }
    });
}));

/* ----------- Google Strategy ----------- */

var googleAuth = {
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: 'https://pinterest-clone3.herokuapp.com/auth/google/callback'
}

passport.use(new GoogleStrategy(googleAuth, function(token, refreshToken, profile, done){
    User.findOne({'google.id': profile.id}, function(err, user){
        if (err) return done(err);
        if (user) {
            return done(null, user);
        } else {
            var newUser = new User();
            newUser.google.method = 'google';
            newUser.google.id = profile.id;
            newUser.google.username = profile.displayName.split(' ').join('_');
            newUser.google.displayName = profile.displayName;
            newUser.google.token = token;
            newUser.google.photos = profile.photos;

            newUser.save(function(err){
                if (err) return done(err);
                return done(null, newUser);
            });
        }
    });
}));

module.exports = function() {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({_id: id}, function(err, user) {
            done(err, user);
        });
    });
}