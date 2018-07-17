import * as _ from 'lodash';

export interface GraphEvent<Target = any> {
    eventId: string;
    target: Target;
    eventObject: any;
}

export type EventCallback<Target> = (event: GraphEvent<Target>) => void;

export class Subscribable<Target = any> {
    private _subscribtions: { [eventId: string]: EventCallback<Target>[] } = {};

    public on(eventId: string, callback: EventCallback<Target>) {
        if (!this._subscribtions[eventId]) {
            this._subscribtions[eventId] = [];
        }
        this._subscribtions[eventId].push(callback);
    };

    public unsubscribe(callback: EventCallback<Target>) {
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
                c.call(this, {
                    eventId,
                    target: this,
                    eventObject,
                });
            });
        }
    };
}
export default Subscribable;
