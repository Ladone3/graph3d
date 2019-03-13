import { Node } from '../graph/node';
import { WidgetEvents, Widget } from './widget';
export interface NodeWidgetEvents extends WidgetEvents {
    'change:focus': Node;
}
export interface NodeWidgetParameters {
    widgetId: string;
}
export declare abstract class NodeWidget extends Widget {
    private _focusNode?;
    private _prevFocusNode?;
    readonly widgetId: string;
    constructor(parameters: NodeWidgetParameters);
    setFocusNode(target: Node | undefined): void;
    readonly isFocusNodeChanged: boolean;
    readonly focusNode: Node;
    readonly prevFocusNode: Node;
    onRemove(): void;
}
