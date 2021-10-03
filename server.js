var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8000;
var path = require("path");

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static(__dirname));

app.get("/", function(req,res){
    res.sendFile(path.join(__dirname,"/home.html"));;
});

app.get("/plans", function(req,res){
    res.sendFile(path.join(__dirname,"/cwh.html"));;
});

app.get("/login", function(req,res){
    res.sendFile(path.join(__dirname,"/login.html"));;
});
app.get("/registration", function(req,res){
    res.sendFile(path.join(__dirname,"/registration.html"));;
});
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
