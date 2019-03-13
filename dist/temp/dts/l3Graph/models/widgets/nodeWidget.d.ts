import { Node } from '../graph/node';
import { WidgetEvents, Widget } from './widget';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface NodeWidgetEvents<Descriptor extends GraphDescriptor> extends WidgetEvents {
    'change:focus': Node<Descriptor>;
}
export interface NodeWidgetParameters {
    widgetId: string;
}
export declare abstract class NodeWidget<Descriptor extends GraphDescriptor> extends Widget {
    private _focusNode?;
    private _prevFocusNode?;
    readonly widgetId: string;
    constructor(parameters: NodeWidgetParameters);
    setFocusNode(target: Node<Descriptor> | undefined): void;
    readonly isFocusNodeChanged: boolean;
    readonly focusNode: Node<Descriptor>;
    readonly prevFocusNode: Node<Descriptor>;
    onRemove(): void;
}
