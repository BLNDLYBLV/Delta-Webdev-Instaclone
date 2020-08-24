var mongoose = require( 'mongoose' );
// const { stringify } = require('querystring');

var Postschema = new mongoose.Schema({
    id: String, 
    caption: String,
    ownerid: String,
    seenby:[String],
    likesid: [String],
    image: String,
    userpic: String,
    type:  String
});

var Post = mongoose.model("post",Postschema);    

module.exports = Post;