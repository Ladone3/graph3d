import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler, Subscribable } from '../utils';
import { ViewController, ViewControllerEvents } from './viewController';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
export declare class VrViewController extends Subscribable<ViewControllerEvents> implements ViewController {
    protected view: DiagramView;
    protected mouseHandler: MouseHandler;
    protected keyHandler: KeyHandler;
    protected gamepadHandler: GamepadHandler;
    readonly id = "vr-view-controller";
    readonly label = "VR View Controller";
    private vrManager;
    private connectionPromise;
    constructor(view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler, gamepadHandler: GamepadHandler);
    focusOn(): void;
    switchOn(): void;
    switchOff(): void;
    private onKeyPressed;
    private onPresentingChanged;
}
