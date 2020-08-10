var express   =require('express');
var app       =express();
var mongoose  =require('mongoose');
var bcrypt    =require('bcrypt');
var passport  =require('passport');

// import{name} from './main.js';

const User = require("../models/User");
var signerrors = [];
var logerrors = [];

app.get('/login', (req,res) => {
    res.render('login.ejs',{errors: logerrors});
});

app.get('/signup', (req,res) => {
    res.render('signup.ejs',{errors: signerrors});
});

app.post('/signup', (req,res) =>{
    var username   =req.body.username; 
    var password   =req.body.password; 
    var repassword =req.body.retypepassword;
    var emailid    =req.body.emailid;
    var redir=0;
    function hasWhiteSpace(s) {
        return s.indexOf(' ') >= 0;
      }
    if(!username || !password || !repassword || !emailid)
    {
        signerrors.push('Please enter every credentials');
        redir=1;
    }
    if(hasWhiteSpace(username))
    {
        signerrors.push('Ensure no spaces in username');
        redir=1;
    }
    if(password!=repassword)
    {
        signerrors.push('The Passwords do not match');
        redir=1;
    }

    if(redir==1)
    {
        res.render('signup.ejs',{errors: signerrors});
    }
    else
    {
        User.findOne({username: username})
            .then(user =>{
                if(user)
                {   
                    signerrors.push('Username already exists!');
                    res.render('signup.ejs',{errors: signerrors });
                }
                else
                {
                    var newUser = new User({
                        id: Date.now(),
                        username: username,
                        password: password, 
                        email: emailid,
                        bio: "",
                        profpic: "/uploads/empty-profile-pic-300x300.png"
                    });
                    // name.push(newUser);

                    logerrors.push('Your account has been registered');

                    bcrypt.genSalt(10, (err, salt)=> {
                        bcrypt.hash(newUser.password, salt, (err, hash)=>{
                            if(err) throw err;

                            newUser.password=hash;
                            newUser.save()
                                .then( user =>{
                                    res.redirect('/users/login');
                                })
                        })
                    })


                }
            });
    }
});

app.post('/login',(req,res,next) =>{
    passport.authenticate('local',{
        successRedirect: '/feed',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
});

app.get('/logout',(req,res,next) =>{
    req.logout();
    req.flash('error',"You are logged out");
    res.redirect("/users/login");
})
module.exports =app;

