import { events, eventBus } from '../../services/event-bus';
export class AutomationManager {

    autoEventMap = {};
    autoEventMapFlat = {};

    constructor(SocketServer) {
        this.socketServer = SocketServer;
        this.socketServer.socketIo.on('connection', socket => {
            socket.on('*', payload => {
                events.observer.next({payload: payload.data, remoteId: socket.handshake.query.remoteId, internal: false});
                this.mapAutoEvent(payload.data, socket.handshake.query.remoteId);
                this.tryAutomatedEvent(payload.data[0]);
            })
        });

        eventBus.subscribe(event => {
            if (event.payload === 'remoteDisconnected') {
                delete this.autoEventMap[event.remoteId];
                this.flattenEventMap()
            }
        });
    }

    tryAutomatedEvent(eventName) {
        try {
            if (this.autoEventMapFlat[eventName]) {
                console.log(`Triggering auto Switch trigger: ${eventName}`);

                const eventToSend = this.autoEventMapFlat[eventName].split(':');

                this.socketServer.getRemoteConnection(eventToSend[0]).emit('invokeAction', {
                    device: eventToSend[1],
                    action: eventToSend[2]
                });
            }
        } catch (e) {
        }
    }

    mapAutoEvent(payload, remoteId) {
        if (payload[0] !== 'availableActions') return;

        payload[1]
            .filter(device => device.type === 'Switch' && device.config && device.config.trigger)
            .forEach(device => this.addAutoTriggerEvent(device, remoteId));

    }

    flattenEventMap() {
        this.autoEventMapFlat = {};

        Object.keys(this.autoEventMap)
            .forEach(key => {
                this.autoEventMapFlat = Object.assign({}, this.autoEventMapFlat, this.autoEventMap[key])
            });

        console.log(this.autoEventMapFlat);

    }

    addAutoTriggerEvent(device, remote) {
        if (!this.autoEventMap[remote]) this.autoEventMap[remote] = {};

        this.autoEventMap[remote][`${remote}:${device.config.trigger}:touch`] = `${remote}:${device.name}:toggleState`;
        this.flattenEventMap();

    }

}