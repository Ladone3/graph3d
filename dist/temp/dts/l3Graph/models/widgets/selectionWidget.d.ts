import { Element } from '../graph/graphModel';
import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
export interface SelectionParameters {
    diagramModel: DiagramModel;
}
export declare class SelectionWidget extends Widget {
    readonly widgetId: string;
    private readonly diagramModel;
    constructor(parameters: SelectionParameters);
    readonly selectedElements: Element[];
    private updateSubscription;
}
