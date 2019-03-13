export interface EventObject<Key, Events> {
    eventId: Key;
    data: Events;
}
export declare type EventCallback<Events, Key extends keyof Events> = (event: EventObject<Key, Events[Key]>) => void;
export declare class Subscribable<Events> {
    private _subscriptions;
    private _subscriptionsOnAny;
    on<Key extends keyof Events>(eventId: Key, callback: EventCallback<Events, Key>): void;
    onAny(callback: EventCallback<Events, keyof Events>): void;
    unsubscribe<Key extends keyof Events>(eventId: Key, callback: EventCallback<Events, Key>): void;
    unsubscribeFromAll(callback: EventCallback<Events, keyof Events>): void;
    trigger<Key extends keyof Events>(eventId: Key, eventObject?: Events[Key]): void;
}
export default Subscribable;
