var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var port = process.env.PORT || 8080;

app.get('/', function(req, res){
   res.sendFile(__dirname + '/dist/index.html');
});
app.get('/bundle.min.js', function(req, res){
   res.sendFile(__dirname + '/dist/bundle.min.js');
});
// app.use('/', express.static(path.join(__dirname, '/dist')));
app.use('/', express.static(path.join(__dirname, '/')));


http.listen(port, function(){
   console.log('listening on *:' + port);
});
