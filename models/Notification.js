var mongoose = require('mongoose');

var NotificationSchema = new mongoose.Schema({
    id: String,
    from: String,
    to: String,
    message: String,
    pic: String,
    sendto: String,
    userpic: String
});

var Notification = mongoose.model('notification',NotificationSchema);

module.exports=Notification;