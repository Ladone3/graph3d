import { MouseHandler } from '../input/mouseHandler';
import { Subscribable } from '../utils';
import { KeyHandler } from '../input/keyHandler';
import { ViewController, ViewControllerEvents } from './viewController';
import { GamepadHandler } from '../input/gamepadHandler';
import { Core } from '../core';
export declare class VrViewController extends Subscribable<ViewControllerEvents> implements ViewController {
    protected core: Core;
    protected mouseHandler: MouseHandler;
    protected keyHandler: KeyHandler;
    protected gamepadHandler: GamepadHandler;
    readonly id = "vr-view-controller";
    readonly label = "VR View Controller";
    private vrManager;
    constructor(core: Core, mouseHandler: MouseHandler, keyHandler: KeyHandler, gamepadHandler: GamepadHandler);
    focusOn(): void;
    switchOn(): void;
    switchOff(): void;
    private onKeyPressed;
    private onPresentingChanged;
}
