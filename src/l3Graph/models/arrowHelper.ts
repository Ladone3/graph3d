import { Vector3D } from './primitives';
import { Subscribable } from '../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Node } from './node';

export interface ArrowHelperParameters {
    focusNode?: Node;
}

export interface ArrowHelperEvents extends WidgetEvents {
    'change:focus': Node;
}

export class ArrowHelper extends Subscribable<ArrowHelperEvents> implements Widget {
    private _focusNode?: Node;
    public readonly widgetId: string;

    constructor(parameters: ArrowHelperParameters = {}) {
        super();
        this.widgetId = 'o3d-arrow-helper-widget';
        this.focusNode = parameters.focusNode;
    }

    set focusNode(target: Node | undefined) {
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
