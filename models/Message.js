var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    room: String,
    time: String,
    message: String,
    from: String,
    to: String
});

var Message= mongoose.model("message",MessageSchema);

module.exports = Message;