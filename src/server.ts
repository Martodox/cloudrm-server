'use strict';

// Load environment variables from file if present
import dotenv = require('dotenv');
dotenv.config({
  silent: true,
  path: 'src/.env'
});

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected', socket);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('test', function(msg){
    console.log('message: ' + msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

