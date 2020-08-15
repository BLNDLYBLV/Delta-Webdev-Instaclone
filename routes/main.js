var express = require('express');
var app = express();
var mongoose = require('mongoose');
var {ensureAuthenticated}=require('../config/auth');
var async = require('async')



var Post=require('../models/Post');
var User= require('../models/User');
var Comment= require('../models/Comment');
var Notification= require('../models/Notification');
var Message= require('../models/Message');

const e = require('express');
const { forEach } = require('async');
var msgerrchat;
var name=[];
var notifs=[];
var postcomms=[];

var namepic=[];
var nameflag=0;



app.get('/', (req,res) => {
    res.redirect('/users/login');
    // res.render('entry.ejs');
});



app.get('/feed',ensureAuthenticated,async(req,res)=>{
    postcomms=[];
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
    // console.log(notifs);
    var feedposts=[];
    req.user.followingid.forEach(async(id)=>{
        await Post.find({ownerid: id},(err,posts)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                posts.forEach(async (post)=>{
                    feedposts.push(post);
                });
                feedposts.sort((a,b)=> a.id-b.id );
            }
        });
    });
    
    // console.log(postcomms);

    Comment.find({postid: req.user.ownposts[0]},(err,pso)=>{
        if(err)
        {
            console.log(err);
        }
        else
        {
            // console.log(feedposts);
            if(feedposts.length!=0){
            feedposts.forEach(async (post,index)=>{
                // console.log('goes inside');
                await Comment.find({postid: post.id},(err,comments)=>{
                    // console.log(comments);
                    comments.forEach(comm=>{
                        // console.log(comm);
                        postcomms.push(comm);
                    });
                    if(index==feedposts.length-1){
                        res.render('feed.ejs',{user: req.user,posts:feedposts,comments: postcomms,names:name,notifs: notifs});
                    } 
                });
            });
            }
            else{
                res.render('feed.ejs',{user: req.user,posts:feedposts,comments: postcomms,names:name,notifs:notifs});
            }
            // console.log(postcomms);
        }
    })
});

app.get('/chat',ensureAuthenticated,(req,res)=>{
    res.render('chat.ejs',{msg: msgerrchat,user: req.user,names:name,notifs:notifs});
    msgerrchat=undefined;
});

app.get('/create',ensureAuthenticated,(req,res)=>{
    
    res.render('create.ejs',{user: req.user,names: name,notifs:notifs});
});

app.get('/profile',ensureAuthenticated,async(req,res)=>{
    let posts=[];
    let profcomms=[];
    let i;
    let postid;
    for(i=0;i<req.user.ownposts.length;i++)
    {
        await Comment.find({to: req.user.id},(err,comms)=>{
            if(err){
                console.log(err);
            }
            else{
                profcomms=comms;
            }
        });
        postid = req.user.ownposts[i];
        Post.findOne({id: postid},(err,post)=>{
            if(err)
            {
                console.log(err);                
            }
            else
            {
                // console.log(postid);
                // console.log(post);
            
                
                posts.push(post);
                // console.log(posts);

            }
        });
    }
    Post.findOne({username: postid},(err,post)=>{
        // console.log(posts);
        // console.log(profcomms);
        res.render('profile.ejs',{user: req.user,posts: posts,comments: profcomms,names: name,notifs:notifs});
    });
    
});

app.get('/notification',(req,res)=>{
    User.findOneAndUpdate({id:req.user.id},{newnotifs: 0},{useFindAndModify:false},(err,user)=>{
        if(err){
            console.log(err);
        }
    });
    res.render('notifications.ejs',{user: req.user,names: name,notifs:notifs});
})

app.get('/profile/:id',(req,res)=>{
    var getid = req.params.id;
    let profcomms=[];
    if(getid==req.user.id)
    {
        res.redirect('/profile');
    }
    else
    {
        User.findOne({id: getid},async (err,user)=>{
            if(err)
            {
                console.log(err);
            }
            else
            {
                let posts=[];
                let i;
                let postid;
                for(i=0;i<user.ownposts.length;i++)
                {
                    
                    postid = user.ownposts[i];
                    Post.findOne({id: postid},(err,post)=>{
                        if(err)
                        {
                            console.log(err);                
                        }
                        else
                        {
                            // console.log(postid);
                            // console.log(post);
                        
                            
                            posts.push(post);
                    // console.log(posts);

                        }
                    });
                }
                await Comment.find({to: user.id},(err,comms)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        profcomms=comms;
                    }
                });
                // console.log(profcomms);
                Post.findOne({id: postid},(err,post)=>{
                    // console.log(posts);
                    
                    res.render('oprofile.ejs',{user:req.user,ouser: user,comments:profcomms,posts: posts,names: name,notifs:notifs});
                });
            }
        });
    }
});

app.get('/p/:postid',async(req,res)=>{
    var postid=req.params.postid;
    var postcomments;
    var postinguser;
    var realpost;
    await Comment.find({postid:postid},(err,comms)=>{
        if(err){
            console.log(err);
        }
        else{
            postcomments=comms;
        }
    });
    await Post.findOne({id:postid},async(err,post)=>{
        if(err){
            console.log(err);
        }
        else{
            realpost=post;
        }
    });
    await User.findOne({id: realpost.ownerid},(err,user)=>{
        if(err){
            console.log(err);
        }
        else{
            postinguser=user;
        }
    });
    // console.log(postcomments);
    // console.log(postinguser);
    // console.log(realpost);
    res.render('post.ejs',{names:name,user:req.user,ouser:postinguser,post:realpost,comments:postcomments,notifs:notifs});
});

app.post('/create/uploads/:imageloc',(req,res)=>{
    let imgloc = req.params.imageloc;
    let caption = req.body.caption;
    let ownerid = req.user.id;
    // console.log(req.user._id);
    let newpost = new Post({
        id: Date.now(),
        caption: caption,
        ownerid: ownerid,
        image: imgloc,
        userpic: req.user.profpic
    });
    // console.log(req.user);
    User.findOneAndUpdate({id:req.user.id},{$push:{ownposts: newpost.id}},{useFindAndModify: false},(err,user)=>{
        if(err)
        {
            console.log(err);            
        }
        else
        {
            // console.log(user);            
            // user.ownposts.push(newpost._id);
        }
    });
    newpost.save(); 
    res.redirect('/profile');
});

app.post('/chat',ensureAuthenticated,(req,res)=>{
    var person=req.body.person;
    var f1=0;

    User.findOne({username: person},(err,user)=>{
        if(err){
            console.log(err);            
        }
        else{
            if(user==null || user==undefined || user==''){
                msgerrchat="username not found";
                res.redirect('/chat');
                
            }
            else
            {
                req.user.inchat.forEach((prof) => {
                    if(prof.username==person)
                    {
                        f1=1;
                    }
                });
                if(req.user.id==user.id){
                    f1=1;
                }
                if(f1==0){
                    var rand=Date.now();
                    User.findOneAndUpdate({id: req.user.id},{$push:{inchat: {chatid: user.id,userpic: user.profpic,roomid: String(rand)}}},{useFindAndModify: false},(err,user)=>{
                        if(err){
                            console.log(err);                            
                        }
                    });
                    User.findOneAndUpdate({id: user.id},{$push:{inchat: {chatid: req.user.id,userpic: req.user.profpic,roomid: String(rand)}}},{useFindAndModify: false},(err,user)=>{
                        if(err){
                            console.log(err);                            
                        }
                    });
                }
                res.redirect('/chat');
            }
        }
    });
});


app.post('/chat/:id',ensureAuthenticated,(req,res)=>{
    var person=req.params.id;
    var f1=0;

    User.findOne({id: person},(err,user)=>{
        if(err){
            console.log(err);            
        }
        else{
            if(user==null || user==undefined || user==''){
                msgerrchat="username not found";
                res.redirect('/chat');   
            }
            else
            {
                req.user.inchat.forEach((prof) => {
                    if(prof==person)
                    {
                        f1=1;
                    }
                });
                if(f1==0){
                    User.findOneAndUpdate({id: req.user.id},{$push:{inchat: {chatid: person,userpic: user.profpic,roomid: String(rand)}}},{useFindAndModify: false},(err,user)=>{
                        if(err){
                            console.log(err);                            
                        }
                    });
                    User.findOneAndUpdate({id: user.id},{$push:{inchat: {chatid: req.user.id,userpic: req.user.profpic,roomid: String(rand)}}},{useFindAndModify: false},(err,user)=>{
                        if(err){
                            console.log(err);                            
                        }
                    });
                }
                res.redirect('/chat');
            }
        }
    });
});
app.post('/delete/:postid',ensureAuthenticated,(req,res)=>{
    var postid=req.params.postid;
    Notification.find({sendto: '/p/'+postid},(err,notif)=>{
        if(err){
            console.log(err);
        }
        else{
            notif.forEach(doc=>{
                doc.deleteOne();
            });
        }
    });
    Comment.find({postid:postid},(err,comms)=>{
        if(err){
            console.log(err);
        }
        else{
            comms.forEach(comm=>{
                comm.deleteOne();
            })
        }
    });
    User.findOneAndUpdate({id:req.user.id},{$pull: {ownposts: postid}},{useFindAndModify:false},(err,user)=>{
        if(err){
            console.log(err);
        }
    });
    Post.findOneAndDelete({id:postid},(err,post)=>{
        if(err){
            console.log(err);
        }
    });
    res.redirect('/profile');
});

module.exports =app;

