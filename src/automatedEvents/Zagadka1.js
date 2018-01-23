import {Event} from "./Event";

const trigger = 'GRZYBY_1:Button1:press';

const actionsToPerform = [
    {
        remote: 'GRZYBY_1',
        device: 'Switch1',
        action: 'toggleState'
    },
    {
        remote: 'GRZYBY_1',
        device: 'Switch2',
        action: 'toggleState'
    }
];

export class Zagadka1 extends Event{


    constructor(SocketServer) {
        super(SocketServer);

        this.events.subscribe((data) => {
            if (data.payload[0] === trigger) {
                this.triggerAction('Zagadka1:Button1:start');

                console.log('Włączam timer')

                setTimeout(() => {

                    actionsToPerform.forEach(action => {
                        this.socketServer.getRemoteConnection(action.remote).emit('invokeAction', {
                            device: action.device,
                            action: action.action
                        });
                    });


                    this.triggerAction('Zagadka1:Button1:done')
                }, 2000)




            }

        })

    }


}