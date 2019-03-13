import { Subscribable } from '../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Node } from './node';
import { Element } from './graphModel';
export interface SelectionParameters {
    selection?: Set<Element>;
}
export interface SelectionEvents extends WidgetEvents {
    'change:focus': Node;
}
export declare class Selection extends Subscribable<SelectionEvents> implements Widget {
    private _selection?;
    readonly widgetId: string;
    constructor(parameters?: SelectionParameters);
    selection: Set<Element>;
    private updateView;
}
