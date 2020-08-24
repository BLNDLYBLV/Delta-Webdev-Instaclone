// const Reply = require("../models/Reply");

var socket=io.connect("http://localhost:3000");
// var arr=[];
// var prevpost=[]

var needprofpicc=document.getElementsByClassName('postprofpi');
var needcommprofpicc=document.getElementsByClassName('commprofpi');
// console.log(needprofpicc);


for(var i=0;i<needprofpicc.length;i++)
{
    var gettingusername = needprofpicc[i].id.substr(11,150);
    // console.log(i);
    // console.log(gettingusername);
    profpicaddition(gettingusername);
}

// console.log(needcommprofpicc);
for(var i=0;i<needcommprofpicc.length;i++)
{
    var gettingusername = needcommprofpicc[i].id.substr(11,150);
    // console.log(i);
    // console.log(gettingusername);
    socket.emit('needuserpiccomm',({
        commid: gettingusername
    }))
}

var isreply=0;

var reporigcomm;

function replyinputon(user,postid,commid){
    reporigcomm=commid;
    var comminp=document.getElementById('feedcomminp'+postid);
    comminp.style.color='blue';
    comminp.value='@'+user+': ';
    comminp.style.color='black';
    comminp.focus();
    isreply=1;
}


var idid; 

function comment(postid,fromid,fromname,to,commid) {
    var comminp=document.getElementById('feedcomminp'+postid);
    var commbox=document.getElementById('commentbox'+postid);
    var messag=comminp.value;
    if(messag!='')
    {
        idid=Date.now();
        if(isreply==0){
            socket.emit('newcomment',{
                id:idid,
                postid: postid,
                from: fromid,
                to: to,
                message: messag 
            });
            comminp.value='';
            commbox.innerHTML+=`<div id="comm`+ idid +`" style="margin-top: 1px; margin-left: 10px; font-size: 15px;"><strong>`+ fromname +' ' +`  </strong><span style="font-weight: 350; font-size:14px;"> `+ messag +`</span><button onClick="delchatmodalon(`+ idid +`)" class="far fa-trash-alt del" style="color: rgb(240,240,240);font-size:13px;border:none;background-color:white;margin-left: 20px;"></button></div>
            <div id="delmodal`+ idid +`" class="postmodal">
                            <div style="width: 400px;height: 185px;position: fixed;top: 50%;left: 50%;margin-left: -190px;margin-top: -90px;border-radius: 20px; background-color: white;">
                                <div style="text-align: center; margin-top: 30px;font-weight: 600;font-size: 16px;">Delete comment?</div>
                                <hr style="margin-top: 35px;margin-bottom: 0:px;">
                                <button onclick="delcomm(`+ idid +`);" style="border: none;color: rgb(200,30,80);font-weight: 700; width: 390px;margin-left: 5px; background-color: white; margin-top: 7px;margin-bottom: 7px;"> Yes </button>
                                <hr style="margin-top: 0px;margin-bottom: 0px;">
                                <button onclick="closedelmodal();" style="border: none;width: 390px;margin-left: 5px;font-weight: 400;font-size: 14px; background-color: white; margin-top: 7px;margin-bottom: 7px;"> No </button>
                            </div>
                        </div>`;
        }
        else{
            var msgloc='';
            var usrnamloc='';
            var usrid;
            for(var i=messag.indexOf('@')+1;i<messag.length;i++){
                if(messag[i]!=':'){
                    usrnamloc+=messag[i];
                }
                else{
                    msgloc=messag.substr(i+1,500);
                    break;
                }
            }
            socket.emit('newreply',{
                id: idid,
                from: fromid,
                to: to,
                message: messag,
                postid:postid,
                origcommid: reporigcomm
            });
            var origcm=document.getElementById(reporigcomm);

            console.log(commid);
            comminp.value='';
            origcm.innerHTML+=`<div id="comm`+ idid +`" style="margin-top: 1px; margin-left: 10px; font-size: 15px;"><strong style="margin-left: 20px" >` + fromname +' ' +`  </strong><span style="font-weight: 350; font-size:14px;"> `+ msgloc +`</span><button onClick="delchatmodalon(`+ idid +`)" class="far fa-trash-alt del" style="color: rgb(240,240,240);font-size:13px;border:none;background-color:white;margin-left: 20px;"></button></div>
            <div id="delmodal`+ idid +`" class="postmodal">
                            <div style="width: 400px;height: 205px;position: fixed;top: 50%;left: 50%;margin-left: -190px;margin-top: -90px;border-radius: 20px; background-color: white;">
                                <div style="text-align: center; margin-top: 30px;font-weight: 600;font-size: 16px;">Delete comment?</div>
                                <hr style="margin-top: 35px;margin-bottom: 0:px;">
                                <button onclick="delcomm(`+ idid +`);" style="border: none;color: rgb(200,30,80);font-weight: 700; width: 390px;margin-left: 5px; background-color: white; margin-top: 7px;margin-bottom: 7px;"> Yes </button>
                                <hr style="margin-top: 0px;margin-bottom: 0px;">
                                <button onclick="closedelmodal();" style="border: none;width: 390px;margin-left: 5px;font-weight: 400;font-size: 14px; background-color: white; margin-top: 7px;margin-bottom: 7px;"> No </button>
                            </div>
                        </div>`;
        }
    }
}



function profpicaddition(postid){
    // console.log('onloadworks');
    socket.emit('needuserpicfeed',{postid: postid});
}

function like(postid,userid,likesid){
    // var likeflag=0;
    
    
    // var stringer='';
    // var i,j,previ=0;
    // if(prevpost.includes(postid)==false)
    // {
    //     for(i=0;i<likesid.length;i++)
    //     {
    //         if(likesid[i]==',')
    //         {
    //             for(j=previ;j<i;j++)
    //             {
    //                 stringer+=likesid[j];
    //             }
    //             arr.push(stringer);
    //             stringer='';
    //             previ=i+1
    //         }
    //         if(i==likesid.length-1)
    //         {
    //             for(j=previ;j<=i;j++)
    //             {
    //                 stringer+=likesid[j];
    //             }
    //             arr.push(stringer);
    //             stringer='';
    //         }
    //     }
    //     prevpost.push(postid);
    // }
    socket.emit('like',{
        postid: postid,
        userid:userid
    });
    // console.log(arr);
    // console.log(arr.includes(username));
    // if(arr.includes(username))
    // {
    //     likeflag=1;
    //     arr=arr.filter(item => item!=username);
    // }
    // else{
    //     arr.push(username);
    // }
    
}
socket.on('likerepl',(data)=>{
    var likenum=document.getElementById('likesnum'+data.postid);
    var likeicon=document.getElementById('likeicon'+data.postid);

    // console.log(data.likeflag);
    if(data.likeflag==0)
    {
        likeicon.classList.remove="far";
        likeicon.className="fas fa-heart";
        if(likenum){
        likenum.innerHTML= String(Number(likenum.innerHTML[0])+1)+" likes"
        }    
    }
    else{
        likeicon.classList.remove="fas";
        likeicon.className="far fa-heart";
        if(likenum){
        likenum.innerHTML= String(Number(likenum.innerHTML[0])-1)+" likes"
        }    
    }
});

socket.on('feeduserpicreply',data=>{
    // console.log(data);
    var chatpic=document.getElementById('postprofpic'+data.username);

    chatpic.src=data.userpic;
});

socket.on('commuserpicreply',data=>{
    // console.log(data);
    // console.log('commuserpic'+data.commid);
    var commpic= document.getElementById('commuserpic'+data.commid);
    commpic.forEach(commimg => {
        commimg.src=data.userpic;
    });
});