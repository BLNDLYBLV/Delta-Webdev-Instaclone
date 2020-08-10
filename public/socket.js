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

console.log(needcommprofpicc);
for(var i=0;i<needcommprofpicc.length;i++)
{
    var gettingusername = needcommprofpicc[i].id.substr(11,150);
    // console.log(i);
    console.log(gettingusername);
    socket.emit('needuserpiccomm',({
        commid: gettingusername
    }))
}


function comment(postid,fromid,fromname,to) {
    var comminp=document.getElementById('feedcomminp'+postid);
    var commbox=document.getElementById('commentbox'+postid);
    var messag=comminp.value;
    if(messag!='')
    {
        socket.emit('newcomment',{
            postid: postid,
            from: fromid,
            to: to,
            message: messag 
        });
        comminp.value='';
        commbox.innerHTML+='<div style="margin-top: 1px; margin-left: 10px; font-size: 15px;"><strong>'+ fromname +' ' +'  </strong><span style="font-weight: 350; font-size:14px;"> '+ messag +'</span></div>';
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

    console.log(data.likeflag);
    if(data.likeflag==0)
    {
        likeicon.classList.remove="far";
        likeicon.className="fas fa-heart";
        likenum.innerHTML= String(Number(likenum.innerHTML[0])+1)+" likes"
    }
    else{
        likeicon.classList.remove="fas";
        likeicon.className="far fa-heart";
        likenum.innerHTML= String(Number(likenum.innerHTML[0])-1)+" likes"
    }
});

socket.on('feeduserpicreply',data=>{
    // console.log(data);
    var chatpic=document.getElementById('postprofpic'+data.username);

    chatpic.src=data.userpic;
});

socket.on('commuserpicreply',data=>{
    // console.log(data);
    console.log('commuserpic'+data.commid);
    var commpic= document.getElementById('commuserpic'+data.commid);
    commpic.forEach(commimg => {
        commimg.src=data.userpic;
    });
});