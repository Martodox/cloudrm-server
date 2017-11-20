import { SEQUENCE } from '../types';
import { SEND_EVENT } from '../actions';


export const GRZYB_1 = {

    type: SEQUENCE,
    trigger: [
        'GRZYBY_1 Button1',
        'GRZYBY_1 Button2',
        'GRZYBY_1 Button4',
        'GRZYBY_1 Button5',
    ],
    deactivateOnSuccess: true,
    onActivation: [
        {
            type: SEND_EVENT,
            delay: 0,
            event: {
                remote: 'GRZYBY_1',
                device: 'Switch1',
                action: 'toggleState'

            }

        },
        {
            type: SEND_EVENT,
            delay: 0,
            event: {
                remote: 'GRZYBY_1',
                device: 'Switch2',
                action: 'toggleState'

            }

        },
        {
            type: SEND_EVENT,
            delay: 3000,
            event: {
                remote: 'GRZYBY_1',
                device: 'Switch1',
                action: 'toggleState'

            }

        }
    ]


};

export const GRZYB_2 =  {

    type: SEQUENCE,
    trigger: [
        'GRZYBY_1 Button3',
        'GRZYBY_1 Button2',
        'GRZYBY_1 Button5',
        'GRZYBY_1 Button4',
    ],
    deactivateOnSuccess: true,
    onActivation: [
        {
            type: SEND_EVENT,
            delay: 0,
            event: {
                remote: 'GRZYBY_1',
                device: 'Switch1',
                action: 'toggleState'

            }

        },
        {
            type: SEND_EVENT,
            delay: 0,
            event: {
                remote: 'GRZYBY_1',
                device: 'Switch2',
                action: 'toggleState'

            }

        },
        {
            type: SEND_EVENT,
            delay: 3000,
            event: {
                remote: 'GRZYBY_1',
                device: 'Switch1',
                action: 'toggleState'

            }

        }
    ]


};