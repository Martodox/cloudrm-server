import webSocketServer from '/web-socket-server/web-socket-server';
import express from 'express';
import http from 'http';
import sqlite3 from 'sqlite3';

const sqliteVerbose = sqlite3.verbose();

const db = new sqliteVerbose.Database('./storage/db.db');

const expressServer = express();

const server = http.Server(expressServer);

const socketServer = new webSocketServer(server, db);

expressServer.get('/', (req, res) => {
  res.send(JSON.stringify(Object.keys(socketServer.devices)));
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});

