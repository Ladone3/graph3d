import { Vector3D } from './primitives';
import { uniqueId } from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { Link } from './link';
import { isTypesEqual } from '../utils';

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
    public incomingLinks: Map<string, Link> = new Map();
    public outgoingLinks: Map<string, Link> = new Map();
    private _data: NodeContent;
    private _types: string[];
    private _position: Vector3D;

    constructor(parameters: NodeParameters<NodeContent>) {
        super();

        this.id = parameters.id || uniqueId('Node-');
        this._types = parameters.types || [DEFAULT_NODE_TYPE_ID];
        this._data = parameters.data;
        this._position = parameters.position;
    }

    get types() {
        return this._types;
    }
    set types(types: string[]) {
        if (!isTypesEqual(this._types, types)) {
            this._types = types;
            this.trigger('force-update');
        }
    }

    get data() {
        return this._data;
    }
    set data(data: NodeContent) {
        if (this._data !== data) {
            this._data = data;
            this.trigger('force-update');
        }
    }

    get position() {
        return this._position;
    }
    set position(position: Vector3D) {
        const previous = this._position;
        this._position = position;
        this.trigger('change:position', previous);
    }

    forceUpdate() {
        this.trigger('force-update');
    }

    remove() {
        this.trigger('remove');
    }
}
