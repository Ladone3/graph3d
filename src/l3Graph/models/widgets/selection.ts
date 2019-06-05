import { Subscribable } from '../../utils/subscribeable';
import { Widget, WidgetEvents } from './widget';
import { Element, isNode, GraphModel } from '../graphModel';

export interface SelectionParameters {
    selection?: Set<Element>;
    graph: GraphModel;
}

export interface SelectionEvents extends WidgetEvents {
    'change': ReadonlySet<Element>;
}

export class Selection extends Subscribable<SelectionEvents> implements Widget {
    public readonly widgetId: string;
    private _elements?: ReadonlySet<Element>;
    private readonly graph: GraphModel;

    constructor(parameters: SelectionParameters) {
        super();
        this.widgetId = 'l3graph-selection-widget';
        this._elements = parameters.selection || new Set<Element>();
        this.graph = parameters.graph;

        this.graph.on('remove:elements', e => {
            const newSelection: Set<Element> = new Set(this._elements);
            const deletedElements = e.data;
            for (const el of deletedElements) {
                newSelection.delete(el);
            }
            this.setSelection(newSelection);
        });
    }

    setSelection(elements: ReadonlySet<Element>) {
        elements = elements || new Set<Element>();
        if (this._elements !== elements) {
            if (this._elements) {
                this._elements.forEach(el => {
                    el.unsubscribe(this.updateView);
                });
            }
            if (elements) {
                elements.forEach(el => {
                    if (isNode(el)) {
                        el.on('change:position', this.updateView);
                        el.on('change:size', this.updateView);
                    }
                });
            }
            this.updateView();
            this.trigger('change');
        }

        this._elements = elements;
        this.updateView();
    }

    get elements(): ReadonlySet<Element> {
        return this._elements;
    }

    private updateView = () => {
        this.trigger('update:widget', this);
    }
}
