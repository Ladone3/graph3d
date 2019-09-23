import { Node } from '../node';
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
                this._prevFocusNode.unsubscribe(this.updateView);
            }
            if (this._focusNode) {
                this._focusNode.on('change:position', this.updateView);
            }
        }

        this.updateView();
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

    private updateView = () => {
        this.trigger('update:widget', this);
    }

    onRemove() {
        if (this._focusNode) { this._focusNode.unsubscribe(this.updateView); }
    }
}
