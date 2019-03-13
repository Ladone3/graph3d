import { Element } from '../graph/graphModel';
import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface SelectionParameters<Descriptor extends GraphDescriptor> {
    diagramModel: DiagramModel<Descriptor>;
}
export declare class SelectionWidget<Descriptor extends GraphDescriptor> extends Widget {
    readonly widgetId: string;
    private readonly diagramModel;
    constructor(parameters: SelectionParameters<Descriptor>);
    readonly selectedElements: Element<Descriptor>[];
    private updateSubscription;
}
