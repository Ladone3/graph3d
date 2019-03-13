import Subscribable from './subscribable';
export * from './colorUtils';
export * from './shapeUtils';
export * from './subscribable';
export * from './geometry';
export interface CancellationEvents {
    'cancel': void;
}
export declare class Cancellation extends Subscribable<CancellationEvents> {
    isCancelled: boolean;
    stop(): void;
}
export declare function animationFrameInterval(intervalCallback: () => void): Cancellation;
export declare function generate128BitID(): string;
