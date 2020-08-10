

var names=[];
names = JSON.parse(document.getElementById('variableJSON').innerHTML);
document.getElementById('variableJSON').innerHTML='';
console.log(names);
var match;
var i;
var search=document.getElementById('search');
var prevelem=document.getElementsByClassName('ddelement');
var dropdown=document.getElementsByClassName('dropdown');
// var actdropdown=document.getElementsByClassName('activitydropdown');

// window.addEventListener('click',(e)=>{
//     console.log(e.target.id);
//     if(e.target.id.substr(0,8)=='eachnotif' || e.target.id.substr(0,10)=='actdropdown'){
//         actdropdown[0].style.display='block'
//     }
// });

// var activitybtn=document.getElementsByClassName('navbarbtnact');
// activitybtn[0].addEventListener('click',(e)=>{
//     console.log('worksss');
//     activitybtn[0].title='';
// });

function httpGet(theUrl)
{
    console.log("works!");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}
search.addEventListener('input',async ()=>
{
    
    console.log(prevelem);
    // for(i=0;i<prevelem.length;i++) 
    // {
    //     prevelem[i].remove();
    // }
    document.querySelectorAll('.ddelement').forEach(e => e.remove());
    console.log(search.value);
    if(search.value=='')
    {
        console.log("empty");
    }
    else
    {
        matches=await names.filter(id=>{
            const regex = new RegExp(`^${search.value}`,'gi');
            return id.username.match(regex);
        });
        // console.log(names);
        console.log(matches);
        matches.forEach(match=>{
            var newform=document.createElement('form');
            var newdiv=document.createElement("button");
            newdiv.className="ddelement";
            // newdiv.setAttribute("onclick","httpGet('/profile/'+match.username);");
            var newimg=document.createElement('img');
            newimg.className="searchpic";
            newimg.src=match.profpic;
            var newname=document.createElement('span');
            newname.className="searchname";
            newname.innerHTML=match.username;
            newdiv.appendChild(newimg);
            newdiv.appendChild(newname);
            newform.method="GET";
            newform.action='/profile/'+match.id;
            newform.appendChild(newdiv);
            dropdown[0].appendChild(newform);
            
        });
    }
});