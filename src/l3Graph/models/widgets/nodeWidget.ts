import { Node } from '../graph/node';
import { WidgetEvents, Widget } from './widget';

export interface NodeWidgetEvents extends WidgetEvents {
    'change:focus': Node;
}

export interface NodeWidgetParameters {
    widgetId: string;
}

export abstract class NodeWidget extends Widget {
    private _focusNode?: Node;
    private _prevFocusNode?: Node;
    public readonly widgetId: string;

    constructor(parameters: NodeWidgetParameters) {
        super();
        this.widgetId = parameters.widgetId;
    }

    setFocusNode(target: Node | undefined) {
        this._prevFocusNode = this._focusNode;
        this._focusNode = target;

        if (this.isFocusNodeChanged) {
            if (this._prevFocusNode) {
                this._prevFocusNode.unsubscribe(this.forceUpdate);
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

    get focusNode(): Node {
        return this._focusNode;
    }

    get prevFocusNode(): Node {
        return this._prevFocusNode;
    }

    onRemove() {
        if (this._focusNode) { this._focusNode.unsubscribe(this.forceUpdate); }
    }
}
