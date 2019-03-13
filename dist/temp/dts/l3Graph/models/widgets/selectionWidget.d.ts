import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
import { Node } from '../graph/node';
import { Link } from '../graph/link';
export interface SelectionParameters {
    diagramModel: DiagramModel;
}
export declare class SelectionWidget extends Widget {
    readonly widgetId: string;
    private readonly diagramModel;
    constructor(parameters: SelectionParameters);
    readonly selectedElements: (Link<any> | Node<any>)[];
    private updateSubscription;
}
