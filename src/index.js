import WebSocketServer from '/components/web-socket-server/web-socket-server';
import SessionManagement from '/components/session-management/session-management';
import RemoteManagement from '/components/remote-management/remote-management';


const SocketServer = new WebSocketServer();

new SessionManagement(SocketServer);
new RemoteManagement(SocketServer);


