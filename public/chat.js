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

needprofpicc.forEach(async(eachchat) => {
    var gettingusername = eachchat.id.substr(4,150);
    // console.log(gettingusername);
    await profpicaddition(gettingusername);
});

function newchat(usrid,ousrid,ousernam,ouserpic,usernam,romid){ 
    var chatpicnew=document.getElementById('chatpic'+ousrid);
    var profpointer=document.getElementsByClassName('profpointer');
    sendinp.disabled=false;
    profpointer[0].action='/profile/'+ousrid;
    profpointer[1].action='/profile/'+ousrid;
    console.log(chatpicnew.src);
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

socket.on('userpicreply',async(data)=>{
    var chatpic=document.getElementById('chatpic' + data.userid);

    chatpic.src=data.userpic;
});

socket.on('lastmsg',(data)=>{
    var needed=document.getElementById(data.roomid);
    needed.innerHTML=data.msg;
});

socket.on("replyfromdb",messages=>{
    console.log(messages);
    chatbox.innerHTML=''
    if(messages!=null)
    {
        for(var i=0;i<messages.length;i++)
        {
            if(messages[i].from==userid)
            {
                console.log('works');
                chatbox.innerHTML+="<div id='msg"+messages[i].id +"' style='margin-bottom:-10px;'><div class='mymsg' style='display: inline-block' >"+ messages[i].message +"</div><button onClick='delchatmodalon("+messages[i].id +")' class='far fa-trash-alt del' style='color: rgb(240,240,240);font-size:13px;border:none;background-color:white;'></button></div>";
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
    var delmsg=document.getElementById('msg'+currentmsgid);
    delmsg.remove();
    closedelmodal();
    // location.reload();
}
socket.on('newchat',data=>{
    chatbox.innerHTML+="<div class='omsg' >"+ data.message +"</div>"
});
var there=document.getElementById('there');
if(there){
    var chatidd=document.getElementById('chatidd');
    var useridd=document.getElementById('useridd');
    var chatnamee=document.getElementById('chattername');
    var chatpicc=document.getElementById('chatpicture');
    var usernamee=document.getElementById('usernamee');
    var roomidd=document.getElementById('roomidd');
    newchat(useridd.innerHTML,chatidd.innerHTML,chatnamee.innerHTML,chatpicc.innerHTML,usernamee.innerHTML,roomidd.innerHTML);
}
