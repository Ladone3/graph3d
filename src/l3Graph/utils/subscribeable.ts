import * as _ from 'lodash';

export interface EventObject<Key = any, Events = any> {
    eventId: Key;
    data: Events;
}

export type EventCallback<Events = any, Key extends keyof Events = any> =
    (event: EventObject<Key, Events[Key]>) => void;

export class Subscribable<Events> {
    private _subscribtions: {[Key in keyof Events]?: EventCallback<Events, Key>[] } = {};
    private _subscribtionsOnAny: EventCallback[] = [];

    public on<Key extends keyof Events>(eventId: Key, callback: EventCallback<Events, Key>) {
        if (!this._subscribtions[eventId]) {
            this._subscribtions[eventId] = [];
        }
        this._subscribtions[eventId].push(callback);
    }

    public onAny(callback: EventCallback) {
        this._subscribtionsOnAny.push(callback);
    }

    public unsubscribe(callback: EventCallback) {
        for (const subscribtionKey in this._subscribtions) {
            if (this._subscribtions[subscribtionKey]) {
                const subscribers = this._subscribtions[subscribtionKey];
                const index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                    return;
                }
            }
        }
    }

    public trigger<Key extends keyof Events>(eventId: Key, eventObject?: Events[Key]) {
        if (this._subscribtions[eventId]) {
            this._subscribtions[eventId].forEach(c => {
                c.call(this, {
                    eventId,
                    target: this,
                    data: eventObject,
                });
            });
        }
        if (this._subscribtionsOnAny) {
            this._subscribtionsOnAny.forEach(c => {
                c.call(this, {
                    eventId,
                    target: this,
                    data: eventObject,
                });
            });
        }
    }
}
export default Subscribable;
