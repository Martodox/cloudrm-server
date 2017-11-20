import { EVENT } from '../types';
import { SEND_EVENT } from '../actions';

export const NOCNA_ZAGADKA = {
    type: EVENT,
    trigger: 'Nocna zagadka trigger',
    onActivation: [
        {
            type: SEND_EVENT,
            event: {
                remote: 'SWIATLO_1',
                device: 'Switch1',
                action: 'toggleState'
            }
        },
        {
            type: SEND_EVENT,
            event: {
                remote: 'GLOSNIK_1',
                device: 'Speaker1',
                action: 'toggleTrack'
            }
        },
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

        },
        {
            type: SEND_EVENT,
            delay: 0,
            event: {
                remote: 'GWIAZDA_1',
                device: 'Switch1',
                action: 'toggleState'

            }
        }
    ]
};