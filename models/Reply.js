var mongoose = require('mongoose');

var ReplySchema = new mongoose.Schema({
    message:    String,
    id:         String,
    from:       String,
    to:         String,
    origcommid: String,
    byuser:     String
});

var Reply = new mongoose.model('reply',ReplySchema);

module.exports = Reply;