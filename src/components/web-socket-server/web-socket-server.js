import socketIo from 'socket.io';
import crypto from 'crypto';
import base64 from 'urlsafe-base64';

import { Remote } from '/models/index';
import { http } from '/services/http-server';


export class WebSocketServer {

  constructor() {

    this.socketIo = socketIo(http);
    this.remotes = {};

    this.socketIo.use((socket, next) => {
      return this._authMiddleware(socket, next)
    });

    this._startListening()

  }

  /**
   *
   * @param socket
   * @param next
   * @private
   */
  _authMiddleware(socket, next) {

    Remote.findOne({
      where: {
        device_id: socket.handshake.query.remoteId
      }
    }).then((row, err) => {

      if (!!err) {
        return next(new Error('Authentication error: database error'));
      }

      if (!row) {
        return next(new Error('Authentication error: remote not found'));
      }

      try {

        let handshake = base64.decode(socket.handshake.query.handshake);

        const decrypted = crypto.publicDecrypt(row.pem, new Buffer(handshake, "base64")).toString("utf8");

        if (socket.handshake.query.verificationString === decrypted) {
          return next();
        } else {
          return next(new Error('Authentication error: handshake error'));
        }

      } catch (error) {
        return next(new Error('Authentication error: bad key pair'));
      }

    }).catch(error => {
      console.log('Uncaught error', error);
    });

  }

  /**
   *
   * @private
   */
  _startListening() {


    this.socketIo.on('connection', socket => {


      this.remotes[socket.handshake.query.remoteId] = socket;
      console.log(`Remote connected: ${socket.handshake.query.remoteId}`);

      socket.on('disconnect', () => {
        console.log(`Remote had disconnected: ${socket.handshake.query.remoteId}`);
        delete this.remotes[socket.handshake.query.remoteId];
      });

      socket.on('availableActions', actions => {

        this.remotes[socket.handshake.query.remoteId].availableActions = actions;

        console.log('List of available devices', actions)
      })

    });

  }

  getRemotes() {
    const remotes = [];

    for(let remote in this.remotes) {
      remotes.push({
          id: remote,
          actions: this.remotes[remote]['availableActions']
      })
    }

    return remotes;

  }

  getRemote(remoteId) {
    return this.getRemotes()[remoteId];
  }

  getRemoteConnection(remoteId) {
    return this.remotes[remoteId];
  }

};
