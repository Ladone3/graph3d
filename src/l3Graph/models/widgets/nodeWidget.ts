import { Widget, WidgetEvents, WidgetParameters } from '.';
import { Node } from '../node';
import { isNode } from '../graphModel';

export interface NodeWidgetEvents extends WidgetEvents {
    'change:focus': Node;
}

export abstract class NodeWidget extends Widget {
    private _focusNode?: Node;
    public readonly widgetId: string;

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
