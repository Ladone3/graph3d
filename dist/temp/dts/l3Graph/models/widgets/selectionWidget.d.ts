import { Element } from '../graph/graphModel';
import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface SelectionParameters {
    diagramModel: DiagramModel;
}
export declare class SelectionWidget extends Widget {
    readonly widgetId: string;
    private readonly diagramModel;
    constructor(parameters: SelectionParameters);
    readonly selectedElements: Element<GraphDescriptor<unknown, unknown>>[];
    private updateSubscription;
}
