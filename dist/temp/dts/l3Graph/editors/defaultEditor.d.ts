import { KeyHandler } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export declare class DefaultEditor<Descriptor extends GraphDescriptor> {
    private diagramModel;
    private diagramView;
    private mouseHandler;
    private keyHandler;
    constructor(diagramModel: DiagramModel<Descriptor>, diagramView: DiagramView<Descriptor>, mouseHandler: MouseHandler<Descriptor>, keyHandler: KeyHandler);
    private onKeyPressed;
    private onElementDrag;
    private onElementDragEnd;
}
