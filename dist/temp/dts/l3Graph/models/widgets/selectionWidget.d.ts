import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
import { Node } from '../graph/node';
import { Link } from '../graph/link';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface SelectionParameters {
    diagramModel: DiagramModel;
}
export declare class SelectionWidget extends Widget {
    readonly widgetId: string;
    private readonly diagramModel;
    constructor(parameters: SelectionParameters);
    readonly selectedElements: (Link<GraphDescriptor<unknown, unknown>> | Node<GraphDescriptor<unknown, unknown>>)[];
    private updateSubscription;
}
