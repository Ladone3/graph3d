import { Subscribable } from '../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Node } from './node';
export interface ArrowHelperParameters {
    focusNode?: Node;
}
export interface ArrowHelperEvents extends WidgetEvents {
    'change:focus': Node;
}
export declare class ArrowHelper extends Subscribable<ArrowHelperEvents> implements Widget {
    private _focusNode?;
    readonly widgetId: string;
    constructor(parameters?: ArrowHelperParameters);
    focusNode: Node | undefined;
    private updateView;
}
