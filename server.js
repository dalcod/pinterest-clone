var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

var keys = require('./secretKeys');
var routes = require('./routes');
var setUpPassport = require('./setuppassport');

var mongoUrl = process.env.MONGODB_URI;
mongoose.connect(mongoUrl);
mongoose.connection.on('error', console.error.bind('error', console));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: keys.cookieSecret
}));

setUpPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'imgs')));


app.use(routes);

app.listen(process.env.PORT || 3000, function(){
    console.log('Successfully connected on port 3000.');
});