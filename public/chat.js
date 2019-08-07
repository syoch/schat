var user;

//handler
$("#user_msgInput").keypress(function(key){
    if(key.key=="Enter"){
        sock.send(`${user.id} ${getime("pad")} ${user.name} ${$("#user_msgInput").val()}`)
        setTimeout(()=>{$("#user_msgInput").val("")},25);
    }
});



sock = new WebSocket(`ws://${location.hostname}`);
sock.onmessage = (data) => {
    console.log(data.data);
    add(data.data);
    
}
function add(dat){
    msg=$("<span>",{text:dat})
    br=$("<br>")
    $("#message").prepend([msg,br])
}
function appdd(dat){
    msg=$("<span>",{text:dat})
    br=$("<br>")
    $("#message").append([msg,br])
}
console.log("login...");
$.ajax({
    type: "POST",
    url: "/api/login",
    data: {
        prog: "js"
    },
    success: (data) => {
        console.log("Success login!");
        
        user = JSON.parse(data);
        console.log(user);
        $("#userid").html(`あなたは${user.name}としてログインしています`);
    }
});
$.ajax({
    type: "GET",
    url: "/api/messages",
    success: (data) => {
        dat=JSON.parse(data);
        dat.map((data)=>{
            appdd(data);
        })
    }
});


function getime(mode) {
    var jikan = new Date();
    var hour = jikan.getHours();
    var minu = jikan.getMinutes();
    var seco = jikan.getSeconds();
    var year = jikan.getFullYear();
    var mont = jikan.getMonth() + 1;
    var daay = jikan.getDate();
    var th = ('00' + hour).slice(-2);
    var tm = ('00' + minu).slice(-2);
    var ts = ('00' + seco).slice(-2);
    var dy = ('0000' + year).slice(-4);
    var dm = ('00' + mont).slice(-2);
    var dd = ('00' + daay).slice(-2);
    if (mode == "pad") {
        var time = dy + dm + dd + th + tm + ts;
    } else {
        var time = dy + "/" + dm + "/" + dd + th + ":" + tm + ":" + ts;
    }

    return time;
}