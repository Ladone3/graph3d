import * as THREE from 'three';
import { Vectro3D } from './models';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { GraphModel } from './graphModel';

export const DEFAULT_NODE_ID = 'o3d-node';

export interface NodeParameters {
    position: Vectro3D;
    label: string;
    typeId?: string;
}

/**
 * @fires change:position
 * @fires change:label
 */
export class Node extends Subscribable {
    public readonly id: string;
    public readonly typeId: string;
    private label: string;
    private position: Vectro3D;
    private _graph: GraphModel | undefined;

    constructor(parameters: NodeParameters) {
        super();

        this.id = _.uniqueId('Node-');
        this.typeId = parameters.typeId || DEFAULT_NODE_ID;
        this.label = parameters.label;
        this.position = parameters.position;
    }

    setPosition(point: Vectro3D) {
        this.position = _.clone(point);
        this.trigger('change:position', point);
    }

    getPosition() {
        return _.clone(this.position);
    }

    setLabel(label: string) {
        this.label = label;
        this.trigger('change:label', label);
    }

    getLabel() {
        return this.label;
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
