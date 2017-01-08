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
    this.devices = {};

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


    this.db.each(`SELECT * FROM devices WHERE \`device-id\`= ?`, socket.handshake.query.deviceId,(err, row) => {

      if (err) {
        return next(new Error('Authentication error'));
      }

      try {

        let handshake = base64.decode(socket.handshake.query.handshake);

        var decrypted = crypto.publicDecrypt(row.pem, new Buffer(handshake, "base64")).toString("utf8");

        if (socket.handshake.query.handshakeTest === decrypted) {
          return next();
        } else {
          return next(new Error('Authentication error'));
        }

      } catch (error) {
        console.log(error);
        return next(new Error('Authentication error'));
      }

    });

  }

  /**
   *
   * @private
   */
  _startListening() {

    this.socketIo.on('connection', socket => {

      this.devices[socket.handshake.query.deviceId] = socket;

      socket.on('disconnect', () => {
        delete this.devices[socket.handshake.query.deviceId];
      });

    });

  }


};
