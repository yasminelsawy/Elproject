var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt=require('passport-jwt').ExtractJwt;

var config=require('../config/database');
var session = require('express-session');
var Student=require('../models/student');
var Client=require('../models/client');
var jwt=require('jsonwebtoken');


module.exports =function(passport){
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = 'secret';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
   
    Student.getStudentById({id:jwt_payload._id}, function(err, user) {
        
        if (err) {
             Client.getClientById({id:jwt_payload._doc._id}, function(err, user) {
        if (err) {
            return done(err, false, req.flash('signupMessage', 'That email is already taken.'));
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account
        }
    	});

        }

        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account
        }
    });
}));
}