var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    id: String,
    postid: String,
    comment: String,
    from: String,
    to: String
});

var Comment= mongoose.model("comment",CommentSchema);

module.exports = Comment;