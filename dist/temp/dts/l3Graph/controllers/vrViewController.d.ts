import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler, Subscribable } from '../utils';
import { ViewController, ViewControllerEvents } from './viewController';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export declare class VrViewController<Descriptor extends GraphDescriptor> extends Subscribable<ViewControllerEvents> implements ViewController {
    protected view: DiagramView<Descriptor>;
    protected mouseHandler: MouseHandler<Descriptor>;
    protected keyHandler: KeyHandler;
    protected gamepadHandler: GamepadHandler<Descriptor>;
    readonly id = "vr-view-controller";
    readonly label = "VR View Controller";
    private vrManager;
    constructor(view: DiagramView<Descriptor>, mouseHandler: MouseHandler<Descriptor>, keyHandler: KeyHandler, gamepadHandler: GamepadHandler<Descriptor>);
    focusOn(): void;
    switchOn(): void;
    switchOff(): void;
    private onKeyPressed;
    private onPresentingChanged;
}
