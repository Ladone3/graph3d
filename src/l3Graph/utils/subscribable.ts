export interface EventObject<Key, Events> {
    eventId: Key;
    data: Events;
}

export type EventCallback<Events, Key extends keyof Events> =
    (event: EventObject<Key, Events[Key]>) => void;

export class Subscribable<Events> {
    private _subscriptions: {[Key in keyof Events]?: EventCallback<Events, Key>[] } = {};
    private _subscriptionsOnAny: EventCallback<Events, keyof Events>[] = [];

    public on<Key extends keyof Events>(eventId: Key, callback: EventCallback<Events, Key>) {
        if (!this._subscriptions[eventId]) {
            this._subscriptions[eventId] = [];
        }
        this._subscriptions[eventId].push(callback);
    }

    public onAny(callback: EventCallback<Events, keyof Events>) {
        this._subscriptionsOnAny.push(callback);
    }

    public unsubscribe<Key extends keyof Events>(eventId: Key, callback: EventCallback<Events, Key>) {
        if (this._subscriptions[eventId]) {
            const subscribers = this._subscriptions[eventId];
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
                return;
            }
        }
    }

    public unsubscribeFromAll(callback: EventCallback<Events, keyof Events>) {
        for (const subscriptionKey in this._subscriptions) {
            if (this._subscriptions[subscriptionKey]) {
                const subscribers = this._subscriptions[subscriptionKey];
                const index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                    return;
                }
            }
        }
    }

    public trigger<Key extends keyof Events>(eventId: Key, eventObject?: Events[Key]) {
        if (this._subscriptions[eventId]) {
            this._subscriptions[eventId].forEach(c => {
                c.call(this, {
                    eventId,
                    target: this,
                    data: eventObject,
                });
            });
        }
        if (this._subscriptionsOnAny) {
            this._subscriptionsOnAny.forEach(c => {
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
