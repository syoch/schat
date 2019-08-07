const http = require('http');
const net  =require("net");
var   db = require('./database.json');
const fs = require("fs");

var wssm=[
    {"server":0},
    {"port":8081},
    {"noServer":true}
]
var wss = new (require("ws").Server)(wssm[2]);
accesscounter={};
setInterval(()=>{
    
},1000*60);
http_S=http.createServer(function (request, response) {
    
    ip= reqtoip(request)
    console.log(
        ("     "+request.method).slice(-5),
        ("                    "+request.url).slice(-20),
        ip);
    accesscounter=(accesscounter[ip]||0)+1;
    if(accesscounter[ip]>12){
        response.end("一分間には12アクセスが限界です");
        return;
    }
    
    if (request.method == "POST") {
        
        //request.on("data",(a)=>{console.log(a.toString())});
        switch(request.url){
            
            case "/api/login":{
                if(db.user[ip]==undefined){
                    db.user[ip]={name:"@guest@",id:"9999"};
                    save();
                }
                response.end(JSON.stringify(db.user[ip]))
                break;
            }
            case "/api/register":{
                request.on("data",(a)=>{
                    //example name=[syoch]&hash="0000"
                    data={};
                    tmp=decodeURIComponent(a).toString().split("&");
                    for(i=0;i<tmp.length;i++){
                        f=tmp[i].split("=");
                        data[f[0]]=f[1];
                    }
                    //console.log(data)
                    ips=Object.keys(db.user);
                    iselse=false;
                    
                    for(i=0;i<ips.length;i++){
                        //console.log(db.user[ips[i]].name)
                        if(db.user[ips[i]].name==data.name){iselse=true;break;}
                    }
                    response.end(iselse.toString());
                    if(iselse==false){
                        db.user[ip]={
                            name:data.name,
                            id:data.hash
                        };
                        save();
                    }
                });
            }
            
        }
    } else if(request.method=="GET"){
        if(request.url=="/api/messages"){
            response.setHeader('Content-Type', 'text/plain;charset=utf-8');
            response.end(JSON.stringify(db.msg.slice(0,50)));
        }else if(request.url=="/api/rerequire"){
            db = JSON.parse(fs.readFileSync("database.json"));
            response.end("done");
        }
        var path = "./public" + request.url;
        if (fileexist(path)) {
            if (fs.statSync(path).isDirectory()) {
                content = fs.readFileSync("./public/404.html");
            } else {
                content = fs.readFileSync(path);
            }
            response.end(content);
        } else {
            content = fs.readFileSync("./public/404.html");
            response.end(content);

        }

    }else{
        response.end("invaild method");
    }
});
http_S.listen(8080);

wss.on("connection", ws => {
    ws.on("message", msg => {
        var src=db.msg;
        src.unshift(msg)
        db.msg=src;
        save();
        wss.clients.forEach(target => {
            target.send(msg);
        })
    })
})

http_S.on('upgrade', function (request, socket, head) {

    // 全ての認証処理を通過した場合、upgrade要求を受け入れる
    wss.handleUpgrade(request, socket, head, (ws) => {
      // コネクションを確立させる
      wss.emit('connection', ws, request);
    });
  });

function save(){
    fs.writeFileSync("database.json",JSON.stringify(db,null,"    "))
}
function fileexist(filePath) {
    var isExist = false;
    try {
        fs.statSync(filePath);
        isExist = true;
    } catch (err) {
        isExist = false;
    }
    return isExist;

}
function reqtoip(request){
    if(request.headers['x-forwarded-for']) {
        return request.headers['x-forwarded-for'];
    }
    
    if(request.connection && request.connection.remoteAddress) {
        return request.connection.remoteAddress;
    }
    
    if(request.connection.socket && request.connection.socket.remoteAddress) {
        return request.connection.socket.remoteAddress;
    }
    
    if(request.socket && request.socket.remoteAddress) {
        return request.socket.remoteAddress;
    }
    return '0.0.0.0';
}