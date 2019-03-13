import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../input/mouseHandler';
import { Subscribable } from '../utils';
import { KeyHandler } from '../input/keyHandler';
import { ViewController, ViewControllerEvents } from './viewController';
import { GamepadHandler } from '../input/gamepadHandler';
export declare class VrViewController extends Subscribable<ViewControllerEvents> implements ViewController {
    protected view: DiagramView;
    protected mouseHandler: MouseHandler;
    protected keyHandler: KeyHandler;
    protected gamepadHandler: GamepadHandler;
    readonly id = "vr-view-controller";
    readonly label = "VR View Controller";
    private vrManager;
    constructor(view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler, gamepadHandler: GamepadHandler);
    focusOn(): void;
    switchOn(): void;
    switchOff(): void;
    private onKeyPressed;
    private onPresentingChanged;
}
