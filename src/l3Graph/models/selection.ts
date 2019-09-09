import { Subscribable } from '../utils/subscribeable';
import { Element, GraphModel } from './graphModel';

export interface SelectionParameters {
    selection?: Set<Element>;
    graph: GraphModel;
}

export interface SelectionEvents {
    'change': ReadonlySet<Element>;
}

export class Selection extends Subscribable<SelectionEvents> {
    public readonly widgetId: string;
    private _elements?: ReadonlySet<Element>;
    private readonly graph: GraphModel;

    constructor(parameters: SelectionParameters) {
        super();
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
            this._elements = elements;
            this.trigger('change');
        }
    }

    get elements(): ReadonlySet<Element> {
        return this._elements;
    }
}
