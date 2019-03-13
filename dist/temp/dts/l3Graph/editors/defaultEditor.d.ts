import { DiagramModel } from '../models/diagramModel';
import { MouseHandler } from '../input/mouseHandler';
import { KeyHandler } from '../input/keyHandler';
import { GamepadHandler } from '../input/gamepadHandler';
export declare class DefaultEditor {
    private diagramModel;
    private mouseHandler;
    private keyHandler;
    constructor(diagramModel: DiagramModel, mouseHandler: MouseHandler, keyHandler: KeyHandler, gamepadHandler: GamepadHandler);
    private subscribeOnDragHandler;
    private onKeyPressed;
    private onElementDrag;
    private onElementDragEnd;
}
