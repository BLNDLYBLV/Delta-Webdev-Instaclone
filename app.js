var express      = require("express");
var app          = express();
var bodyParser   = require("body-parser");
var mongoose     = require("mongoose");
var session      = require("express-session");
var passport     = require("passport"); 
var flash        = require("connect-flash");
var multer       = require("multer");
var path         = require("path");  
var socket       = require("socket.io");
var http         = require("http");
var moment       = require('moment');

var server       = http.createServer(app);
var io           = socket(server);   

var Post         = require('./models/Post');
var User         = require('./models/User');
var Message      = require('./models/Message');
var Comment      = require('./models/Comment');
var Notification = require('./models/Notification');


var {ensureAuthenticated}=require('./config/auth');

mongoose.connect("mongodb://localhost/Instaclone", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


require('./config/passport')(passport);

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'Hail Hydra',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

app.use((req,res,next)=>{
    res.locals.error =req.flash('error');
    next();
});

let storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req,file,cb)=>{
        cb(null,file.fieldname + '-' + Date.now() +path.extname(file.originalname));
    }
});

let upload = multer({
    storage: storage,
    fileFilter: (req,file,cb)=>{
        let filetypes = /jpeg|jpg|png|gif/;
        let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        let mimetype = filetypes.test(file.mimetype);

        if(mimetype && extname)
        {
            return cb(null,true);
        }
        else
        {
            cb('Error: Images only!');
        }
    }
}).any();

var name=[];
var notifs=[];

app.post('/create',ensureAuthenticated,async(req,res)=>{
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
    upload(req,res,(err)=>{
        if(err){
            res.render('create.ejs',{msg: err,names:name});
        }
        else{
            if(req.files == undefined)
            {
                res.render('create.ejs',{msg: "Error: No file selected ",user: req.user,names:name,notifs:notifs});  
            }
            else{
                // console.log(req.file);
                // console.log(req.files);
                res.render('create.ejs',{msg: "File uploaded successfully ",names:name,user: req.user,file: `uploads/${req.files[0].filename}` ,flag: '00',notifs:notifs});  
            }
        }
    });
});

app.post('/changeprofpic',(req,res)=>{
    upload(req,res,(err)=>{
        if(err)
        {
            
            console.log(err);
        }
        else
        {
            
            if(req.files == undefined)
            {
                // console.log(req.files);
                res.redirect('/profile');
            }
            else{
                User.findOneAndUpdate({id: req.user.id},{profpic:`/uploads/${req.files[0].filename}`},{useFindAndModify: false},(err,user)=>{
                    if(err)
                    {
                        console.log(err);
                    }
                    else{
                        res.redirect('/profile');
                    }
                });
                User.update({'inchat.chatid': req.username},{$set:{"inchat.$.profpic":`/uploads/${req.files[0].filename}`}},(err,users)=>{
                    if(err){
                        console.log(err);
                    }
                });
            }    
        }
    });
});

io.on('connection',(socket)=>{
    // console.log(socket.id);
    socket.on('joinroom',async (data)=>{
        // console.log('work');
        socket.join(data.room);
        await Message.find({room: data.room},(err,messages)=>{
            if(err)
            {
                console.log(err);
            }
            else{
                // console.log("work");
                io.to(socket.id).emit('replyfromdb',messages);
            }
        });
    });
    socket.on('newcomment',async(data)=>{
        // console.log(data);
        var postimage;
        var fromname;
        var fropic;

        var newcomment= new Comment({
            id: Date.now(),
            postid: data.postid,
            from: data.from,
            to: data.to,
            comment: data.message
        });
        // console.log(newcomment);
        newcomment.save();
        await Post.findOne({id:data.postid},(err,post)=>{
            if(err){
                console.log(err);
            }
            else{
                postimage=post.image;
            }
        });
        await User.findOne({id: data.from},(err,user)=>{
            if(err){
                console.log(err);
            }
            else{
                fromname=user.username;
                frompic=user.profpic;
            }
        });
        if(data.from!=data.to){
            var newnotif= new Notification({
                id: Date.now(),
                relatedid:newcomment.id,
                from: data.from,
                to: data.to,
                message: ' commented: '+data.message,
                userpic: frompic,
                pic: postimage,
                sendto: '/p/'+data.postid
            });
            newnotif.save();
            User.findOne({id:data.to},(err,user)=>{
                if(err){
                    console.log(err);
                }
                else{
                    user.newnotifs=user.newnotifs+1;
                    user.save();
                }
            });
        }
        // console.log(newcomment);
    });

    socket.on('newmsg',async (data)=>{
        // console.log(data);
        var newmsg = new Message({
            id: Date.now(),
            message: data.message,
            from: data.from,
            to: data.to,
            time: moment().format('h:mm a'),
            room: data.room
        });
        newmsg.save();
        socket.broadcast.to(data.room).emit('newchat',data);
    });
    socket.on('delcomment',(data)=>{
        Comment.findOneAndDelete({id:data.commid},{useFindAndModify:false},(err,comm)=>{
            if(err){
                console.log(err);
            }
        });
        Notification.findOneAndDelete({relatedid:data.commid},{useFindAndModify:false},(err,notif)=>{
            if(err){
                console.log(err);
            }
            else{
                User.findOne({id:notif.to},(err,user)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        user.newnotifs=user.newnotifs-1;
                        user.save();
                    }
                });
            }
        });
        
    });
    socket.on('like',async(data)=>{
        var likeflag=0;
        var ownerid;
        var likername;
        var notpic;
        var userpic;
        // console.log(data);
        
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
        for(var x=0;x<name.length;x++){
            if(name[x].id==data.userid){
                userpic=name.profpic;
            }
        }
        // console.log('userpic:',userpic);
        await Post.findOne({id:data.postid},(err,post)=>{
            if(err)
            {
                console.log(err);
            }
            ownerid=post.ownerid;
            notpic=post.image;
            // console.log(post.likesid.includes(data.username));
            // console.log(post.likesid);
            // console.log(post.likesid.includes(data.userid));
            if(post.likesid.includes(data.userid))
            {
                likeflag=1;
            }
        });
        // console.log(likeflag);
        await User.findOne({id:data.userid},(err,user)=>{
            if(err){
                console.log(err);
            }
            else{
                userpic=user.profpic;
            }
        });
        for(var x=0;x<name.length;x++)
        {
            if(data.userid==name[x].id){
                likername=name[x].username;
                break;
            }
        }
        if(likeflag==0)
        {
            Post.findOneAndUpdate({id:data.postid},{$push:{likesid:data.userid}},{useFindAndModify: false},(err,post)=>{
                if(err){
                    console.log(err);
                }
                else{
                    // console.log(post);
                    
                    // console.log(name);
                    
                    // console.log('goes to post find');
                }
            });
            if(data.userid!=ownerid)
            {
                // console.log('goes to notif');
                var newnotif= new Notification({
                    id: Date.now(),
                    from: data.userid,
                    to: ownerid,
                    message:' liked your photo',
                    userpic: userpic,
                    pic: notpic,
                    sendto: '/p/'+data.postid
                });
                // console.log(newnotif);
                newnotif.save();
                User.findOne({id:ownerid},(err,user)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        user.newnotifs=user.newnotifs+1;
                        user.save();
                    }
                });
            }
        }
        else{
            
            Post.findOneAndUpdate({id:data.postid},{$pull:{likesid:data.userid}},{useFindAndModify: false},(err,post)=>{
                if(err){
                    console.log(err);
                }
                else{
                    
                    Notification.findOneAndDelete({from: data.userid , message: ' liked your photo',pic: post.image },{useFindAndModify: false},(err,notif)=>{
                        if(err){
                            console.log(err);
                        }
                        if(notif){
                            User.findOne({id:notif.to},(err,user)=>{
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    user.newnotifs=user.newnotifs+1;
                                    user.save();
                                }
                            });
                        }
                    });
                }
            });
        }
        
        io.to(socket.id).emit('likerepl',{likeflag:likeflag,postid:data.postid})
        likeflag=0;
    });
    socket.on('deletemsg',(data)=>{
        // console.log(data);
        Message.findOneAndDelete({id:data.msgid},{useFindAndModify:false},(err,msg)=>{
            if(err){
                console.log(err);
            }
        });
    });
    socket.on('unfollow',(data)=>{
        // console.log('works')
        User.findOneAndUpdate({id: data.userid},{$pull:{followingid: data.ouserid}},{useFindAndModify: false},(err,user)=>{
            if(err)
            {
                console.log(err);
            }
            else{
                Notification.findOneAndDelete({message: ' started following you',to:data.ouserid},(err,notif)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        User.findOne({id:notif.to},(err,user)=>{
                            if(err){
                                console.log(err);
                            }
                            else{
                                user.newnotifs=user.newnotifs+1;
                                user.save();
                            }
                        });
                    }
                });
            }
        });
        User.findOneAndUpdate({id: data.ouserid},{$pull:{followerid: data.userid}},{useFindAndModify: false},(err,user)=>{
            if(err)
            {
                console.log(err);
            }
        });
    });
    socket.on('follow',(data)=>{
        // console.log(data);
        User.findOneAndUpdate({id: data.userid},{$push:{followingid: data.ouserid}},{useFindAndModify: false},(err,user)=>{
            if(err)
            {
                console.log(err);
            }
            else{
                var newnotif= new Notification({
                    id:Date.now(),
                    from: data.userid,
                    to: data.ouserid,
                    message: ' started following you',
                    userpic: user.profpic,
                    sendto: '/profile/'+data.userid,
                    pic: 'no'
                });

                newnotif.save();
                User.findOne({id:data.ouserid},(err,user)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        user.newnotifs=user.newnotifs+1;
                        user.save();
                    }
                });
            }
        });
        User.findOneAndUpdate({id: data.ouserid},{$push:{followerid: data.userid}},{useFindAndModify: false},(err,user)=>{
            if(err)
            {
                console.log(err);
            }
        });
    });
    socket.on('needuserpic',async(data)=>{
        // console.log(data);
        await User.findOne({id:data.userid},(err,user)=>{
            io.to(socket.id).emit('userpicreply',{userid:data.userid,userpic: user.profpic});
        });
    });
    socket.on('needuserpicfeed',async(data)=>{
        // console.log(data);
        await Post.findOne({id:data.postid},(err,post)=>{
            User.findOne({userid: post.ownerid},(err,user)=>{
                io.to(socket.id).emit('feeduserpicreply',{username:data.postid,userpic: user.profpic});
            });
            
        });
    });
    socket.on('needuserpiccomm',async(data)=>{
        // console.log(data);
        await Comment.findOne({id: data.commid},(err,comm)=>{
            User.findOne({userid: comm.from},(err,user)=>{
                io.to(socket.id).emit('commuserpicreply',{commid:data.commid,userpic: user.profpic});
            });
        });    
    });
    socket.on('needlastmsg',async(data)=>{
        var lastmsg;
        var max=0;
        await Message.find({room:data.roomid},(err,msgs)=>{
            if(err){
                console.log(err);
            }
            else{
                if(msgs)
                {
                    msgs.forEach(msg=>{
                        if(Number(msg.id)>max){
                            max=Number(msg.id);
                        }
                    });
                }
            }
        });
        if(max!=0){
            await Message.findOne({id:String(max)},(err,msg)=>{
                if(err){
                    console.log(err);
                }
                else{
                    lastmsg=msg.message;
                }
            });
            io.to(socket.id).emit('lastmsg',{roomid:data.roomid,msg:lastmsg});
        }   
    });

});


app.use('/',require('./routes/main.js'));
app.use('/account',require('./routes/account.js'));
app.use('/users',require('./routes/users.js'));

server.listen(3000);