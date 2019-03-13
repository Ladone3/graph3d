import { Subscribable } from '../utils/subscribable';
import { Core } from '../core';
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
    private core;
    private keyMap;
    private cancellation;
    constructor(core: Core);
    switchOn(): void;
    switchOff(): void;
    private onKeyDown;
    private onKeyUp;
    private start;
}
