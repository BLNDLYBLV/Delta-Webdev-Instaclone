var localStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var User = require('../models/User');

module.exports = (passport) =>{
    passport.use(
        new localStrategy({usernameField: 'username'},(username,password,done) =>{
            User.findOne({username: username.trim()})
                .then(user =>{
                    if(!user)
                    {
                        console.log(username.trim());                        
                        return done(null,false,{message: "This username does not exist"});
                    }
                    bcrypt.compare(password, user.password, (err, isMatch) =>{
                        if(err) throw err;

                        if(isMatch)
                        {
                            return done(null,user);
                        }
                        else
                        {
                            return done(null,false,{message: "The password does not match"});
                        }
                    })
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user._id);
      });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}