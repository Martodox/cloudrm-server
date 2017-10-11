export class EventManager {

    socketServer = null;

    constructor(SocketServer) {
        this.socketServer = SocketServer;

        this.socketServer.socketIo.on('connection', socket => {

            console.log('new on connection!!!!')

            socket.on('somethingHappen', payload => {
                console.log('somethingHappen', payload, socket.handshake.query.remoteId)
            })

        });

    }
}