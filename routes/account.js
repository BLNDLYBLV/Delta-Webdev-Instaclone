var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bcrypt =require('bcrypt');
var {ensureAuthenticated}=require('../config/auth');



var Post=require('../models/Post');
var User= require('../models/User');
var Notification= require('../models/Notification');
var Comment= require('../models/Comment');
var Message= require('../models/Message');
const e = require('express');
const { forEach } = require('async');


var editmsg='';
var name=[];
var notifs=[];

function hasWhiteSpace(s) {
    return s.indexOf(' ') >= 0;
}

app.get('/edit',async (req,res)=>{
    notifs=[];
    await User.find({},(err,users)=>{    
        if(err){
            console.log(err);
        }
        else{
            while(name.length > 0) {
                name.pop();
            }

            users.forEach(user => {
                name.push(user);
            });
            // console.log(name);
            // return name;
        }
    });
    await Notification.find({to:req.user.id},(err,notifications)=>{
        if(err){
            console.log(err);
        }
        else{
            notifs=notifications;
        }
    });
    // console.log(editmsg);
    res.render('edit.ejs',{user:req.user,msg:editmsg,names:name,notifs:notifs});
    editmsg='';
    // console.log(editmsg);    
});

app.get('/password',(req,res)=>{
    res.render('passchange.ejs',{user:req.user,names:name,notifs:notifs});
});

app.post('/edit',(req,res)=>{
    var username=req.body.username;
    var bio=req.body.bio;
    var email=req.body.email;
    function hasWhiteSpace(s) {
        return s.indexOf(' ') >= 0;
    }
    if(hasWhiteSpace(username)){
        editmsg='Username contains spaces!';
        res.redirect('/account/edit');
    }
    else
    {
        User.findOne({username: username},(err,user)=>{
            if(err){
                console.log(err);            
            }
            else{
                if(user && username!=req.user.username){
                    editmsg='Username already exists loser!';
                    res.redirect('/account/edit');
                    // console.log(editmsg);            
                }
                else{
                    User.findOneAndUpdate({username: req.user.username},{username: username,bio: bio,email: email},{useFindAndModify: false},(err,user)=>{
                        if(err){
                            console.log(err);
                        }
                    });
                    res.redirect('/profile');
                }
            }
        });
    }
});

app.post('/changepass',(req,res)=>{
    var oldpass=req.body.oldpass;
    var newpass=req.body.newpass;
    var newpassagain=req.body.confirmnewpass;

    bcrypt.compare(oldpass,req.user.password,(err,ismatch)=>{
        if(newpass==newpassagain && !(hasWhiteSpace(newpass)))
        {
            bcrypt.genSalt(10, (err, salt)=> {
                bcrypt.hash(newpass, salt, (err, hash)=>{
                    if(err){
                        console.log(err);
                    }
                    User.findOne({id:req.user.id},(err,user)=>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            user.password=hash;
                            user.save();
                            res.redirect('/profile');
                        }
                    });

                    // newUser.password=hash;
                    // newUser.save()
                    //     .then( user =>{
                    //         res.redirect('/users/login');
                    //     })
                });
            });
        }
    });
});

module.exports =app;
