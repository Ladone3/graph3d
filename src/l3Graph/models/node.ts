import { Vector3D } from './primitives';
import { uniqueId } from 'lodash';
import { Link } from './link';
import { isTypesEqual } from '../utils';
import { Point, PointEvents } from './point';

export const DEFAULT_NODE_TYPE_ID = 'o3d-node';
export const DEFAULT_NODE_SIZE: Vector3D = { x: 15, y: 15, z: 15 };

export interface NodeParameters<NodeContent> {
    id?: string;
    position: Vector3D;
    types?: string[];
    data?: NodeContent;
    size?: Vector3D;
}

export interface NodeEvents extends PointEvents {
    'change:size': Vector3D;
}

export class Node<NodeContent = any> extends Point<NodeEvents> {
    public readonly id: string;
    public incomingLinks: Map<string, Link> = new Map();
    public outgoingLinks: Map<string, Link> = new Map();
    private _data: NodeContent;
    private _types: string[];
    private _size: Vector3D;

    constructor(parameters: NodeParameters<NodeContent>) {
        super(parameters);

        this.id = parameters.id || uniqueId('Node-');
        this._types = parameters.types || [DEFAULT_NODE_TYPE_ID];
        this._data = parameters.data;
        this._position = parameters.position;
        this._size = parameters.size || DEFAULT_NODE_SIZE;
    }

    get types() {
        return this._types;
    }
    setTypes(types: string[]) {
        if (!isTypesEqual(this._types, types)) {
            this._types = types;
            this.trigger('force-update');
        }
    }

    get data() {
        return this._data;
    }
    setData(data: NodeContent) {
        if (this._data !== data) {
            this._data = data;
            this.trigger('force-update');
        }
    }

    get size() {
        return this._size;
    }
    setSize(size: Vector3D) {
        const previous = this._size;
        this._size = size;
        this.trigger('change:size', previous);
    }
}
