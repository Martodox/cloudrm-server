import socketIo from 'socket.io';
import crypto from 'crypto';
import base64 from 'urlsafe-base64';
import socketioWildcard from 'socketio-wildcard';

import { events } from '../../services/event-bus';
import { Remote, User } from '/models/index';
import { http } from '/services/http-server';


export class WebSocketServer {

  constructor() {

    this.socketIo = socketIo(http);
    this.remotes = {};
    this.socketIo.use(socketioWildcard());
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
      console.log(`${new Date()} | Uncaught error`, error);
    });

  }

  /**
   *
   * @private
   */
  _startListening() {


    this.socketIo.on('connection', socket => {


      this.remotes[socket.handshake.query.remoteId] = socket;
      console.log(`${new Date()} | Remote connected: ${socket.handshake.query.remoteId}`);

      socket.on('disconnect', () => {
        console.log(`${new Date()} | Remote had disconnected: ${socket.handshake.query.remoteId}`);
        events.observer.next({payload: 'remoteDisconnected', remoteId: socket.handshake.query.remoteId, internal: true});
        delete this.remotes[socket.handshake.query.remoteId];
      });

      socket.on('availableActions', actions => {
        console.log(`${new Date()} | Setting actions of ${socket.handshake.query.remoteId}`)
        this.remotes[socket.handshake.query.remoteId].availableActions = actions;

      })

    });

  }

  getRemotes() {
    const remotes = [];

    for(let remote in this.remotes) {
      remotes.push({
          id: remote,
          devices: this.remotes[remote]['availableActions'].map(device => {
            device.id = `${remote}:${device.name}`;
            return device;
          })
      })
    }

    return remotes;

  }

  async getEmberRemotes(userid) {
      const remotes = [];
      let devices = [];

      let userRemotes = await User.findOne({
          where: {
              id: userid
          },
          include: [
              {
                  model: Remote
              }
          ]
      });

      userRemotes = userRemotes.Remotes.map(remote => remote.device_id);

      let addRemote = (remote, remotesList) => {

          if (!remotesList[remote]['availableActions']) {
            return;
          }

          remotes.push({
              id: remote,
              devices: remotesList[remote]['availableActions'].map(device => {
                  return `${remote}:${device.name}`;
              })
          });

          devices = devices.concat(remotesList[remote]['availableActions'].map(device => {
              device.id = `${remote}:${device.name}`;
              device.remote = remote;
              return device;
          }));
      };

      for(let remote in this.remotes) {
          if (userRemotes.indexOf(remote) >= 0) {
              addRemote(remote, this.remotes);
          }
      }

      return {
        remotes: remotes,
        devices: devices
      };
  }

  getRemote(remoteId) {
    return this.getRemotes().find(remote => remote.id === remoteId)
  }

  getRemoteConnection(remoteId) {

    return this.remotes[remoteId];
  }

}