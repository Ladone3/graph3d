import { KeyHandler } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Element } from '../models/graph/graphModel';
import { MouseHandler } from '../utils/mouseHandler';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
export declare class DefaultEditor {
    private diagramModel;
    private diagramView;
    private mouseHandler;
    private keyHandler;
    private gamepadHandler;
    constructor(diagramModel: DiagramModel, diagramView: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler, gamepadHandler: GamepadHandler);
    private onKeyPressed;
    private helperMap;
    private onGamepadDown;
    private onGamepadUp;
    private onGamepadMove;
    onElementDrag(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element): void;
    onElementDragEnd(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element): void;
}
