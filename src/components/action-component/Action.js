export class Action {

    triggers = [];
    events = [];
    isEnabled = true;

    addTrigger(trigger) {
        this.triggers.push(trigger);
    }

    addEvent(event) {
        this.events.push(event);
    }

    scheduleTrigger() {

    }

    sendEvents(delay = 0) {

    }
}