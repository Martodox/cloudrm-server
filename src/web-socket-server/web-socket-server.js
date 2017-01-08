import socketIo from 'socket.io';
import crypto from 'crypto';
import base64 from 'urlsafe-base64';


export default class webSocketServer {

  /**
   *
   * @param server
   * @param db
   */
  constructor(server, db) {

    this.socketIo = socketIo(server);
    this.db = db;
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

    this.db.get(`SELECT * FROM devices WHERE \`device-id\`= ?`, socket.handshake.query.remoteId,(err, row) => {

      if (err) {
        return next(new Error('Authentication error: database error'));
      }

      if (!row) {
        return next(new Error('Authentication error: remote not found'));
      }

      try {

        let handshake = base64.decode(socket.handshake.query.handshake);

        var decrypted = crypto.publicDecrypt(row.pem, new Buffer(handshake, "base64")).toString("utf8");

        if (socket.handshake.query.verificationString === decrypted) {
          return next();
        } else {
          return next(new Error('Authentication error: handshake error'));
        }

      } catch (error) {
        return next(new Error('Authentication error: bad key pair'));
      }

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

    });

  }


};