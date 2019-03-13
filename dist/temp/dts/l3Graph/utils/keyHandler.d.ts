import { Subscribable } from './subscribable';
export interface KeyHandlerEvents {
    'keyDown': Set<number>;
    'keyPressed': Set<number>;
    'keyUp': Set<number>;
}
export declare const KEY_CODES: {
    UP: number;
    DOWN: number;
    LEFT: number;
    RIGHT: number;
    SPACE: number;
    CTRL: number;
    PLUS: number;
    MINUS: number;
    DELETE: number;
    ESCAPE: number;
};
export declare class KeyHandler extends Subscribable<KeyHandlerEvents> {
    private keyMap;
    private cancellation;
    switchOn(): void;
    switchOff(): void;
    private onKeyDown;
    private onKeyUp;
    private start;
}
export interface CancellationEvents {
    'cancel': void;
}
export declare class Cancellation extends Subscribable<CancellationEvents> {
    isCancelled: boolean;
    stop(): void;
}
export declare function animationFrameInterval(intervalCallback: () => void): Cancellation;
