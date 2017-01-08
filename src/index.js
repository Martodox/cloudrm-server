import webSocketServer from '/components/web-socket-server/web-socket-server';
import express from 'express';
import http from 'http';
import sequelize from '/models/index';

const expressServer = express();

const server = http.Server(expressServer);

const socketServer = new webSocketServer(server);

expressServer.get('/', (req, res) => {
  res.send(JSON.stringify(Object.keys(socketServer.devices)));
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});

