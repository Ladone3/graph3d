import { Subscribable } from '../../utils/subscribable';
import { Element, GraphModel } from '../graph/graphModel';
export interface SelectionParameters {
    selection?: Set<Element>;
    graph: GraphModel;
}
export interface SelectionEvents {
    'change': ReadonlySet<Element>;
}
export declare class Selection extends Subscribable<SelectionEvents> {
    readonly widgetId: string;
    private _elements?;
    private readonly graph;
    constructor(parameters: SelectionParameters);
    setSelection(elements: ReadonlySet<Element>): void;
    readonly elements: ReadonlySet<Element>;
}
