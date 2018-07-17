import { Vectro3D } from './models';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { GraphModel } from './graphModel';

export const DEFAULT_NODE_TYPE_ID = 'o3d-node';
export const DEFAULT_NODE_SIZE: Vectro3D = { x: 1, y: 1, z: 1 };

export interface NodeParameters {
    position: Vectro3D;
    label: string;
    size?: Vectro3D;
    typeId?: string;
}

/**
 * @fires change:position
 * @fires change:size
 * @fires change:label
 */
export class Node extends Subscribable<Node> {
    public readonly id: string;
    public readonly typeId: string;
    private label: string;
    private position: Vectro3D;
    private size: Vectro3D;
    private _graph: GraphModel | undefined;

    constructor(parameters: NodeParameters) {
        super();

        this.id = _.uniqueId('Node-');
        this.typeId = parameters.typeId || DEFAULT_NODE_TYPE_ID;
        this.label = parameters.label;
        this.position = parameters.position;
        this.size = parameters.size || DEFAULT_NODE_SIZE;
    }

    getPosition() {
        return _.clone(this.position);
    }

    setPosition(position: Vectro3D) {
        this.position = _.clone(position);
        this.trigger('change:position', position);
    }

    getSize() {
        return _.clone(this.size);
    }

    setSize(size: Vectro3D) {
        this.size = _.clone(size);
        this.trigger('change:size', size);
    }

    getLabel() {
        return this.label;
    }

    setLabel(label: string) {
        this.label = label;
        this.trigger('change:label', label);
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
}
