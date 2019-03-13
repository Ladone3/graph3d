import { KeyHandler } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
export declare class DefaultEditor {
    private diagramModel;
    private diagramView;
    private mouseHandler;
    private keyHandler;
    constructor(diagramModel: DiagramModel, diagramView: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler);
    private onKeyPressed;
    private onElementDrag;
    private onElementDragEnd;
}
