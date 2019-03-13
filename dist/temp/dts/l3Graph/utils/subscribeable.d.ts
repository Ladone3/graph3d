export interface EventObject<Key = any, Events = any> {
    eventId: Key;
    data: Events;
}
export declare type EventCallback<Events = any, Key extends keyof Events = any> = (event: EventObject<Key, Events[Key]>) => void;
export declare class Subscribable<Events> {
    private _subscribtions;
    private _subscribtionsOnAny;
    on<Key extends keyof Events>(eventId: Key, callback: EventCallback<Events, Key>): void;
    onAny(callback: EventCallback): void;
    unsubscribe<Key extends keyof Events>(eventId: Key, callback: EventCallback): void;
    unsubscribeFromAll(callback: EventCallback): void;
    trigger<Key extends keyof Events>(eventId: Key, eventObject?: Events[Key]): void;
}
export default Subscribable;
