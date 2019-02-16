import { Vector3D } from './primitives';
import { Subscribable } from '../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Node } from './node';

export const DEFAULT_SELECTION_TYPE_ID = 'o3d-selection';
export const DEFAULT_NODE_SIZE: Vector3D = { x: 1, y: 1, z: 1 };

export interface SelectionParameters {
    focusNode?: Node;
}

export interface SelectionEvents extends WidgetEvents {
    'change:focus': Node;
}

export class Selection extends Subscribable<SelectionEvents> implements Widget {
    private _focusNode?: Node;
    public readonly widgetId: string;

    constructor(parameters: SelectionParameters = {}) {
        super();
        this.widgetId = 'o3d-selection-widget';
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
        this.trigger('widget:update', this);
    }
}
