import { eventBus, events } from '../services/event-bus';
import Rx from 'rxjs/Rx';

export class Event {

    constructor(SocketServer) {
        this.socketServer = SocketServer;
        this.events = eventBus;
    }

    static triggerAction(payload, remoteId) {
        events.observer.next({payload: payload, remoteId: remoteId, internal: true});
    }

    invokeAction(remote, device, action) {
        try {
            this.socketServer.getRemoteConnection(remote).emit('invokeAction', {
                device,
                action
            });
        } catch (e) {
            console.log(`${new Date()} | ${remote} not found or not connected!`);
            console.error(e);
        }
    }

     startSeries(series) {
        let correctHits = 0;
        return Rx.Observable.create(observer => {
            this.events.subscribe((data) => {
                if (series.includes(data.payload[0])) {
                    if (series[correctHits] === data.payload[0]) {
                        correctHits++
                    } else {
                        correctHits = 0;
                    }
                }
                if (correctHits === series.length) {
                    correctHits = 0;
                    observer.next();
                }
            })

        })
    }

}