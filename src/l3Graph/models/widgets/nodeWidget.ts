import { Node } from '../graph/node';
import { WidgetEvents, Widget } from './widget';
import { GraphDescriptor } from '../graph/graphDescriptor';

export interface NodeWidgetEvents<Descriptor extends GraphDescriptor> extends WidgetEvents {
    'change:focus': Node<Descriptor>;
}

export interface NodeWidgetParameters {
    widgetId: string;
}

export abstract class NodeWidget<Descriptor extends GraphDescriptor> extends Widget {
    private _focusNode?: Node<Descriptor>;
    private _prevFocusNode?: Node<Descriptor>;
    public readonly widgetId: string;

    constructor(parameters: NodeWidgetParameters) {
        super();
        this.widgetId = parameters.widgetId;
    }

    setFocusNode(target: Node<Descriptor> | undefined) {
        this._prevFocusNode = this._focusNode;
        this._focusNode = target;

        if (this.isFocusNodeChanged) {
            if (this._prevFocusNode) {
                this._prevFocusNode.unsubscribe('change:position', this.forceUpdate);
            }
            if (this._focusNode) {
                this._focusNode.on('change:position', this.forceUpdate);
            }
        }

        this.forceUpdate();
    }

    get isFocusNodeChanged(): boolean {
        return this._prevFocusNode !== this._focusNode;
    }

    get focusNode(): Node<Descriptor> {
        return this._focusNode;
    }

    get prevFocusNode(): Node<Descriptor> {
        return this._prevFocusNode;
    }

    onRemove() {
        if (this._focusNode) { this._focusNode.unsubscribe('change:position', this.forceUpdate); }
    }
}
