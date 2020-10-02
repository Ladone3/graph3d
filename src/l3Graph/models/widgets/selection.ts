import { Subscribable } from '../../utils/subscribable';
import { GraphModel } from '../graph/graphModel';
import { Node } from '../graph/node';

export interface SelectionParameters {
    selection?: Set<Node>;
    graph: GraphModel;
}

export interface SelectionEvents {
    'change': ReadonlySet<Node>;
}

export class Selection extends Subscribable<SelectionEvents> {
    public readonly widgetId: string;
    private _nodes?: ReadonlySet<Node>;
    private readonly graph: GraphModel;

    constructor(parameters: SelectionParameters) {
        super();
        this._nodes = parameters.selection || new Set<Node>();
        this.graph = parameters.graph;

        this.graph.on('remove:nodes', e => {
            const newSelection = new Set<Node>();
            this._nodes.forEach(n => newSelection.add(n));
            const deletedNodes = e.data;
            for (const node of deletedNodes) {
                newSelection.delete(node);
            }
            this.setSelection(newSelection);
        });
    }

    // todo: make better check of changes
    setSelection(nodes: ReadonlySet<Node>) {
        nodes = nodes || new Set<Node>();
        if (this._nodes !== nodes) {
            this._nodes = nodes;
            this.trigger('change');
        }
    }

    get elements(): ReadonlySet<Node> {
        return this._nodes;
    }
}
