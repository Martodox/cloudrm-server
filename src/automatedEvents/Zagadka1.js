import {Event} from "./Event";

const trigger = 'PI_LOCAL_2:Button2:touch';

const actionsToPerform = [
    {
        remote: 'PI_LOCAL_2',
        device: 'Switch1',
        action: 'toggleState'
    },
    {
        remote: 'PI_LOCAL_1',
        device: 'Switch1',
        action: 'toggleState'
    }
];

export class Zagadka1 extends Event{


    constructor(SocketServer) {
        super(SocketServer);

        this.events.subscribe((data) => {
            if (data.payload[0] === trigger) {
                Event.triggerAction('Zagadka1:Button1:start');

                console.log('Włączam timer')

                setTimeout(() => {

                    actionsToPerform.forEach(action => {
                        this.invokeAction(action.remote, action.device, action.action);
                    });

                        let i = 1;
                        actionsToPerform.forEach(action => {
                            setTimeout(() => {
                                this.invokeAction(action.remote, action.device, action.action);
                            }, 1000 * i++)

                        });



                    Event.triggerAction('Zagadka1:Button1:done')
                }, 2000)




            }

        })

    }


}