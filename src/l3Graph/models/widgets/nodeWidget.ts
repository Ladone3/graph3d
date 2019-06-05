import { Subscribable } from '../../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Node } from '../node';

export interface NodeWidgetParameters {
    focusNode?: Node;
}

export interface NodeWidgetEvents extends WidgetEvents {
    'change:focus': Node;
}

export class NodeWidget extends Subscribable<NodeWidgetEvents> implements Widget {
    private _focusNode?: Node;
    public readonly widgetId: string;

    constructor(parameters: NodeWidgetParameters = {}) {
        super();
        this.widgetId = 'l3graph-node-widget';
        this.setFocusNode(parameters.focusNode);
    }

    setFocusNode(target: Node | undefined) {
        if (target !== this._focusNode) {
            if (this._focusNode) {
                this._focusNode.unsubscribe(this.updateView);
            }
            if (target) {
                target.on('change:position', this.updateView);
            }
        }

        this._focusNode = target;
        this.updateView();
    }

    get focusNode(): Node {
        return this._focusNode;
    }

    private updateView = () => {
        this.trigger('update:widget', this);
    }
}
