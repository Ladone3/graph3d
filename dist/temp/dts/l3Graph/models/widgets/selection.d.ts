import { Subscribable } from '../../utils/subscribable';
import { GraphModel } from '../graph/graphModel';
import { Node } from '../graph/node';
export interface SelectionParameters {
    selection?: Set<Node>;
    graph: GraphModel;
}
export interface SelectionEvents {
    'change': ReadonlySet<Node>;
}
export declare class Selection extends Subscribable<SelectionEvents> {
    readonly widgetId: string;
    private _nodes?;
    private readonly graph;
    constructor(parameters: SelectionParameters);
    setSelection(nodes: ReadonlySet<Node>): void;
    readonly elements: ReadonlySet<Node>;
}
