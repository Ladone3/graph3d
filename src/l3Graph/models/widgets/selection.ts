import { Subscribable } from '../../utils/subscribable';
import { GraphModel } from '../graph/graphModel';
import { Node } from '../graph/node';
import { GraphDescriptor } from '../graph/graphDescriptor';

export interface SelectionParameters<Descriptor extends GraphDescriptor> {
    selection?: Set<Node<Descriptor>>;
    graph: GraphModel<Descriptor>;
}

export interface SelectionEvents<Descriptor extends GraphDescriptor> {
    'change': ReadonlySet<Node<Descriptor>>;
}

export class Selection<Descriptor extends GraphDescriptor> extends Subscribable<SelectionEvents<Descriptor>> {
    public readonly widgetId: string;
    private _nodes?: ReadonlySet<Node<Descriptor>>;
    private readonly graph: GraphModel<Descriptor>;

    constructor(parameters: SelectionParameters<Descriptor>) {
        super();
        this._nodes = parameters.selection || new Set<Node<Descriptor>>();
        this.graph = parameters.graph;

        this.graph.on('remove:nodes', e => {
            const newSelection = new Set<Node<Descriptor>>();
            this._nodes.forEach(n => newSelection.add(n));
            const deletedNodes = e.data;
            for (const node of deletedNodes) {
                newSelection.delete(node);
            }
            this.setSelection(newSelection);
        });
    }

    // todo: make better check of changes
    setSelection(nodes: ReadonlySet<Node<Descriptor>>) {
        nodes = nodes || new Set<Node<Descriptor>>();
        if (this._nodes !== nodes) {
            this._nodes = nodes;
            this.trigger('change');
        }
    }

    get elements(): ReadonlySet<Node<Descriptor>> {
        return this._nodes;
    }
}
