import {Event} from "./Event";

const series = [
    'PI_LOCAL_2:Button1:touch',
    'PI_LOCAL_2:Button3:touch',
    'PI_LOCAL_1:Button3:touch',
    'PI_LOCAL_1:Button2:touch',
    'PI_LOCAL_1:Button1:touch',
    'PI_LOCAL_2:Button4:touch',
    'PI_LOCAL_2:Button5:touch',
    'PI_LOCAL_2:Button6:touch',
    'PI_LOCAL_1:Button6:touch',
    'PI_LOCAL_1:Button7:touch',
    'PI_LOCAL_1:Button5:touch',
    'PI_LOCAL_1:Button4:touch'
];

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

export class Seria1 extends Event {
    constructor(SocketServer) {
        super(SocketServer);



        this.startSeries(series).subscribe(() => {
            console.log('Włączam timer');

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
        })

    }
}