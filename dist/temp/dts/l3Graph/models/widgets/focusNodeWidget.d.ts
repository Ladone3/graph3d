import { NodeWidget, NodeWidgetParameters } from './nodeWidget';
import { DiagramModel } from '../diagramModel';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface FocusNodeWidgetParameters<Descriptor extends GraphDescriptor> extends NodeWidgetParameters {
    diagramModel: DiagramModel<Descriptor>;
}
export declare class FocusNodeWidget<Descriptor extends GraphDescriptor> extends NodeWidget<Descriptor> {
    constructor(parameters: FocusNodeWidgetParameters<Descriptor>);
}
