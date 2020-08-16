var followingbtn = document.getElementById('followingbtn');
var followbtn = document.getElementById('followbtn');
var socket=io.connect("http://localhost:3000");
var ouserid=document.getElementById('ousertxt').innerHTML;
ouserid=ouserid.replace(/\s+/g,'');
var origuserid=document.getElementById('origusername').innerHTML;
origuserid=origuserid.replace(/\s+/g,'');
var flag=0;
{
if(followingbtn!=null){
followingbtn.addEventListener('click',(event)=>{
    if(flag==0)
    {
        followingbtn.classList.remove('followingbtn');
        followingbtn.className='followbtn';
        followingbtn.innerHTML='Follow';
        followingbtn.id='followbtn';
        followbtn = document.getElementById('followbtn');
        socket.emit('unfollow',{userid: origuserid,ouserid: ouserid});
        flag=1;
    }    
});
}
if(followbtn!=null)
{
followbtn.addEventListener('click',(event)=>{
    if(flag==0)
    {
        followbtn.classList.remove('followbtn');
        followbtn.className='followingbtn';
        followbtn.innerHTML='Following<span style="font-size: small;margin-left:4px;" class="fa fa-check-circle"></span>';
        followbtn.id='followingbtn';
        followbtn = document.getElementById('followingbtn');
        socket.emit('follow',{userid: origuserid,ouserid: ouserid});   
        flag=1; 
    }
});
}
}