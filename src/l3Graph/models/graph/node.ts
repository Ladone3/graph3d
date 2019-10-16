import { Vector3D } from '../structures';
import { Link } from './link';
import { Subscribable } from '../../utils';

const SIZE_VALUE = 40;
const DEFAULT_NODE_PARAMETERS: NodeParameters = {
    position: { x: 0, y: 0, z: 0 },
    size: { x: SIZE_VALUE, y: SIZE_VALUE, z: SIZE_VALUE, placeholder: true },
};

export type Size = Vector3D & { placeholder?: boolean };

export interface NodeModel<NodeContent = any> {
    id: string;
    data?: NodeContent;
}

export interface NodeParameters {
    position: Vector3D;
    size?: Vector3D & { placeholder?: boolean };
}

export interface NodeEvents {
    'change:size': Vector3D;
    'change:position': Vector3D;
    'force-update': void;
}

export class Node<NodeContent = any> extends Subscribable<NodeEvents> {
    private _position: Vector3D;
    public incomingLinks: Set<Link> = new Set();
    public outgoingLinks: Set<Link> = new Set();
    public modelIsChanged: boolean = false;
    private _size: Size;

    get id() {
        return this._model.id;
    }

    constructor(
        private _model: NodeModel<NodeContent>,
        parameters: NodeParameters = DEFAULT_NODE_PARAMETERS,
    ) {
        super();
        this._size = parameters.size || DEFAULT_NODE_PARAMETERS.size;
        this._position = parameters.position;
    }

    get position() {
        return this._position;
    }
    setPosition(position: Vector3D) {
        const previous = this._position;
        this._position = position;
        this.trigger('change:position', previous);
    }
    
    get data() {
        return this._model.data;
    }
    setData(data: NodeContent) {
        this._model.data = data;
        this.modelIsChanged = true;
        this.forceUpdate();
    }

    get model(): NodeModel<NodeContent> {
        return this._model;
    }

    get size(): Size {
        return this._size;
    }
    setSize(size: Size) {
        const previous = this._size;
        this._size = size;
        this.trigger('change:size', previous);
    }
    
    forceUpdate() {
        this.trigger('force-update');
    }
}
