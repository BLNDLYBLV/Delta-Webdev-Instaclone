var socket=io.connect("http://localhost:3000");


var mainchatpic = document.getElementById('mainchatpic');
var mainchatname = document.getElementById('mainchatname');
var chatbox = document.getElementById('chatbox');
var sendinp = document.getElementById('sendinp');
var sendbtn = document.getElementById('sendbtn');

var username;
var userid;
var ousername;
var ouserid;

var roomid;

var currentmsgid;

var needlastmsg=document.getElementsByClassName('needlastmsg');

needlastmsg.forEach((need)=>{
    var roomid=need.id;
    socket.emit('needlastmsg',{roomid:roomid});
});

window.addEventListener('click',(e)=>{
    // console.log(e.target.id);
    if(e.target.id=='delmodal'){
        closedelmodal();
    }
});

function closedelmodal(){
    var delmodl=document.getElementById('delmodal');
    // console.log(delmodl);
    delmodl.style.display='none';
}

var needprofpicc=document.getElementsByClassName('needprofpic');
// console.log(needprofpicc);

needprofpicc.forEach(eachchat => {
    var gettingusername = eachchat.id.substr(4,150);
    // console.log(gettingusername);
    profpicaddition(gettingusername);
});

function newchat(usrid,ousrid,ousernam,ouserpic,usernam,romid){ 
    var chatpicnew=document.getElementById('chatpic'+ousrid);
    var profpointer=document.getElementsByClassName('profpointer');
    sendinp.disabled=false;
    profpointer[0].action='/profile/'+ousrid;
    profpointer[1].action='/profile/'+ousrid;
    mainchatpic.src=chatpicnew.src;
    mainchatpic.style.display='inline-block';
    mainchatname.innerHTML=ousernam;
    mainchatname.style.display='inline-block'
    userid=usrid;
    username=usernam;
    ouserid=ousrid;
    ousername=ousernam;
    chatbox.innerHTML='';
    roomid=romid;
    socket.emit('joinroom',{room: romid});
}

function profpicaddition(id){
    // console.log('onloadworks');
    socket.emit('needuserpic',{userid: id});
}

socket.on('userpicreply',data=>{
    var chatpic=document.getElementById('chatpic'+data.userid);

    chatpic.src=data.userpic;
});

socket.on('lastmsg',(data)=>{
    var needed=document.getElementById(data.roomid);
    needed.innerHTML=data.msg;
});

socket.on("replyfromdb",messages=>{
    // console.log("works!");
    if(messages!=null)
    {
        for(var i=0;i<messages.length;i++)
        {
            if(messages[i].from==userid)
            {
                chatbox.innerHTML+="<div style='margin-bottom:-10px;'><div class='mymsg' style='display: inline-block' >"+ messages[i].message +"</div><button onClick='delchatmodalon("+messages[i].id +")' class='far fa-trash-alt del' style='color: rgb(240,240,240);font-size:13px;border:none;background-color:white;'></button></div>";
            }
            else
            {
                chatbox.innerHTML+="<div class='omsg' >"+ messages[i].message +"</div>"
            }
        }
    }
});

function chat(){
    if(sendinp.value!='')
    {
        var message={
            message: sendinp.value,
            from: userid,
            to: ouserid,
            room: roomid  
        }
        socket.emit('newmsg',message);
        sendinp.value='';
        chatbox.innerHTML+="<div class='mymsg'  >"+ message.message +"</div>";
    }
}

function delchatmodalon(id){
    currentmsgid=id;
    var delmodal=document.getElementById('delmodal');
    delmodal.style.display='block';
}

function delmsg(){
    // console.log(currentmsgid);
    socket.emit('deletemsg',{msgid: currentmsgid});
    location.reload();
}
socket.on('newchat',data=>{
    chatbox.innerHTML+="<div class='omsg' >"+ data.message +"</div>"
});
