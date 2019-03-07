import { Vector3D } from './primitives';
import { Subscribable } from '../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Node } from './node';
import { Element, isNode } from './graphModel';

export interface SelectionParameters {
    selection?: Set<Element>;
}

export interface SelectionEvents extends WidgetEvents {
    'change:focus': Node;
}

export class Selection extends Subscribable<SelectionEvents> implements Widget {
    private _selection?: Set<Element>;
    public readonly widgetId: string;

    constructor(parameters: SelectionParameters = {}) {
        super();
        this.widgetId = 'o3d-selection-widget';
        this._selection = parameters.selection || new Set<Element>();
    }

    set selection(selection: Set<Element>) {
        selection = selection || new Set<Element>();
        if (this._selection !== selection) {
            if (this._selection) {
                this._selection.forEach(el => {
                    el.unsubscribe(this.updateView);
                });
            }
            if (selection) {
                selection.forEach(el => {
                    if (isNode(el)) {
                        el.on('change:position', this.updateView);
                    }
                });
            }
        }

        this._selection = selection;
        this.updateView();
    }

    get selection(): Set<Element> {
        return this._selection;
    }

    private updateView = () => {
        this.trigger('widget:update', this);
    }
}
