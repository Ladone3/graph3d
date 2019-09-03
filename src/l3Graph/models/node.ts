import { Vector3D } from './primitives';
import { Link } from './link';
import { isTypesEqual } from '../utils';
import { Point, PointEvents } from './point';

const DEFAULT_NODE_PARAMETERS: NodeParameters = {
    position: { x: 0, y: 0, z: 0 },
    size: { x: 15, y: 15, z: 15, placeholder: true },
};

export type Size = Vector3D & { placeholder?: boolean };

export interface NodeModel<NodeContent = any> {
    id: string;
    types: string[];
    data?: NodeContent;
}

export interface NodeParameters {
    position: Vector3D;
    size?: Vector3D & { placeholder?: boolean };
}

export interface NodeEvents<NodeContent> extends PointEvents {
    'change:size': Vector3D;
}

export class Node<NodeContent = any> extends Point<NodeEvents<NodeContent>> {
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
        super(parameters);
        this._size = parameters.size || DEFAULT_NODE_PARAMETERS.size;
    }

    get types() {
        return this._model.types;
    }
    setTypes(types: string[]) {
        this.setModel({
            ...this.model,
            types,
        });
    }

    get data() {
        return this._model.data;
    }
    setData(data: NodeContent) {
        this.setModel({
            ...this.model,
            data,
        });
    }

    setModel(model: NodeModel<NodeContent>) {
        const typesAreChanged = !isTypesEqual(this._model.types, model.types);
        const dataAreChanged = this._model.data !== model.data;
        const equalIds = this._model.id === model.id;
        if (equalIds && (typesAreChanged || dataAreChanged)) {
            this._model = model;
            this.modelIsChanged = true;
            this.forceUpdate();
        }
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
}
