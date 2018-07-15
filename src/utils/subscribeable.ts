import * as _ from 'lodash';

export type EventCallback = (eventObject?: any) => void;

export class Subscribable {
    private _subscribtions: { [eventId: string]: EventCallback[] } = {};

    public on(eventId: string, callback: EventCallback) {
        if (!this._subscribtions[eventId]) {
            this._subscribtions[eventId] = [];
        }
        this._subscribtions[eventId].push(callback);
    };

    public unsubscribe(callback: EventCallback) {
        _.values(this._subscribtions).forEach(subscribers => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        });
    };

    public trigger(eventId: string, eventObject?: any) {
        if (this._subscribtions && this._subscribtions[eventId]) {
            this._subscribtions[eventId].forEach(c => {
                c.call(this, eventObject);
            });
        }
    };
}
export default Subscribable;
