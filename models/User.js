var mongoose = require( 'mongoose' );
const { stringify } = require('querystring');

var UserSchema = mongoose.Schema({

    id: String,
    newnotifs: Number,
    username: String,
    password: String,
    email: String,
    bio: String,
    profpic: String,
    ownposts: [String],
    followerid: [String],
    followingid: [String],
    inchat: [{
        chatid: String,
        userpic: String,
        roomid: String
    }]
    // notification: [String],
    // notifmsg: [String],
    // events_signed: [String],
    // events_created: [String]
});

var User = mongoose.model('user',UserSchema);

module.exports= User;