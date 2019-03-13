import { Subscribable } from '../../utils/subscribable';
import { GraphModel } from '../graph/graphModel';
import { Node } from '../graph/node';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface SelectionParameters<Descriptor extends GraphDescriptor> {
    selection?: Set<Node<Descriptor>>;
    graph: GraphModel<Descriptor>;
}
export interface SelectionEvents<Descriptor extends GraphDescriptor> {
    'change': ReadonlySet<Node<Descriptor>>;
}
export declare class Selection<Descriptor extends GraphDescriptor> extends Subscribable<SelectionEvents<Descriptor>> {
    readonly widgetId: string;
    private _nodes?;
    private readonly graph;
    constructor(parameters: SelectionParameters<Descriptor>);
    setSelection(nodes: ReadonlySet<Node<Descriptor>>): void;
    readonly elements: ReadonlySet<Node<Descriptor>>;
}
