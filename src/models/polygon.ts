import { Node } from './node';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { GraphModel } from './graphModel';

export const DEFAULT_LINK_ID = 'o3d-link';

export interface PolygonParameters {
    nodes: Node[];
}

/**
 * @fires change:geometry
 */
export class Polygon extends Subscribable<Polygon> {
    public readonly id: string;
    private nodes: Node[];

    private _graph: GraphModel | undefined;

    constructor(parameters: PolygonParameters) {
        super();

        this.id = _.uniqueId('Polygon-');
        this.nodes = parameters.nodes;

        for (const node of this.nodes) {
            node.on('change:position', () => this.performUpdate());
        }
    }

    getNodes() {
        return this.nodes;
    }

    _setGraph(graph: GraphModel) {
        this._graph = graph;
    }

    _getGraph() {
        return this._graph;
    }

    remove() {
        this._graph.removeElement(this);
    }

    private performUpdate() {
        this.trigger('change:geometry');
    }
}
