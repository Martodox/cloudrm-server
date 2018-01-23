import Rx from 'rxjs/Rx';

let observer;

export const events = {
    observer
};

export const eventBus = Rx.Observable.create(function (observer) {
    events.observer = observer
}).publish();

eventBus.connect();
