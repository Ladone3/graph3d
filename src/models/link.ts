import { Node } from './node';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { GraphModel } from './graphModel';

export const DEFAULT_LINK_ID = 'o3d-link';

export interface LinkParameters {
    source: Node;
    target: Node;
    label: string;
    typeId?: string;
}

/**
 * @fires change:label
 * @fires change:geometry
 */
export class Link extends Subscribable<Link> {
    public readonly id: string;
    public readonly typeId: string;
    private label: string;
    private source: Node;
    private target: Node;

    private _graph: GraphModel | undefined;

    constructor(parameters: LinkParameters) {
        super();

        this.id = _.uniqueId('Link-');
        this.typeId = parameters.typeId || DEFAULT_LINK_ID;
        this.label = parameters.label;
        this.source = parameters.source;
        this.target = parameters.target;

        this.source.on('change:position', () => this.performUpdate());
        this.target.on('change:position', () => this.performUpdate());
    }

    setLabel(label: string) {
        this.label = label;
        this.trigger('change:label', label);
    }

    getLabel() {
        return this.label;
    }

    getSource() {
        return this.source;
    }

    getTarget() {
        return this.target;
    }

    getTypeId() {
        return this.typeId;
    }

    remove() {
        this._graph.removeElement(this);
    }

    _setGraph(graph: GraphModel) {
        this._graph = graph;
    }

    _getGraph() {
        return this._graph;
    }

    private performUpdate() {
        this.trigger('change:geometry');
    }
}
