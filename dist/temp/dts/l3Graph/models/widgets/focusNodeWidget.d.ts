import { NodeWidget, NodeWidgetParameters } from './nodeWidget';
import { DiagramModel } from '../diagramModel';
export interface FocusNodeWidgetParameters extends NodeWidgetParameters {
    diagramModel: DiagramModel;
}
export declare class FocusNodeWidget extends NodeWidget {
    constructor(parameters: FocusNodeWidgetParameters);
}
