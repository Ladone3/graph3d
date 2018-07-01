import { Vector3D } from './primitives';
import * as _ from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { Link } from './link';

export const DEFAULT_NODE_TYPE_ID = 'o3d-node';
export const DEFAULT_NODE_SIZE: Vector3D = { x: 1, y: 1, z: 1 };

export interface NodeParameters<NodeContent> {
    id?: string;
    position: Vector3D;
    types?: string[];
    data?: NodeContent;
}

export interface NodeEvents {
    'change:position': Vector3D;
    'force-update': void;
    'remove': void;
}

export class Node<NodeContent = any> extends Subscribable<NodeEvents> {
    public readonly id: string;
    public readonly types: string[];
    public readonly data: NodeContent;
    public incomingLinks: Map<string, Link> = new Map();
    public outgoingLinks: Map<string, Link> = new Map();
    private _position: Vector3D;

    constructor(parameters: NodeParameters<NodeContent>) {
        super();

        this.id = parameters.id || _.uniqueId('Node-');
        this.types = parameters.types || [DEFAULT_NODE_TYPE_ID];
        this.data = parameters.data;
        this._position = parameters.position;
    }

    get position() {
        return _.clone(this._position);
    }
    set position(position: Vector3D) {
        const previous = this._position;
        this._position = _.clone(position);
        this.trigger('change:position', previous);
    }

    forceUpdate() {
        this.trigger('force-update');
    }

    remove() {
        this.trigger('remove');
    }
}
