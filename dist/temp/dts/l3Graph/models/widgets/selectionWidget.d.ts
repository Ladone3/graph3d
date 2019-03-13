import { DiagramModel } from '../diagramModel';
import { Widget } from './widget';
import { Node } from '../graph/node';
export interface SelectionParameters {
    diagramModel: DiagramModel;
}
export declare class SelectionWidget extends Widget {
    readonly widgetId: string;
    private readonly diagramModel;
    constructor(parameters: SelectionParameters);
    readonly selectedElements: (import("../graph/link").Link<any> | Node<any>)[];
    private updateSubscription;
}
