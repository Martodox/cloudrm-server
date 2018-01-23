import { WebSocketServer } from './components/web-socket-server/web-socket-server';
import { SessionManagement } from './components/session-management/session-management';
import { RemoteManagement } from './components/remote-management/remote-management';
import {AutomationManager} from "./components/automation-manager/automation-manager";
import { allEvents } from './automatedEvents/allEvents';
import {eventBus} from "./services/event-bus";



const SocketServer = new WebSocketServer();

new AutomationManager(SocketServer);
new SessionManagement(SocketServer);
new RemoteManagement(SocketServer);

allEvents.forEach(event => new event(SocketServer));

eventBus.subscribe(event => {
    console.log('LOG!', JSON.stringify(event));
});

