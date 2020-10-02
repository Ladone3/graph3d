import { Vector3d, Size } from '../structures';
import { Link } from './link';
import { PointEvents, Point, PointParameters, PointId } from '../point';
import { GraphDescriptor } from './graphDescriptor';

const SIZE_VALUE = 40;
const DEFAULT_NODE_PARAMETERS: NodeParameters = {
    position: { x: 0, y: 0, z: 0 },
    size: { x: SIZE_VALUE, y: SIZE_VALUE, z: SIZE_VALUE, placeholder: true },
};

export type NodeId = PointId & { nodePlaceholder?: boolean };

export interface NodeModel<NodeContent> {
    id: NodeId;
    data?: NodeContent;
}

export interface NodeParameters extends PointParameters {
    size?: Size;
}

export interface NodeEvents extends PointEvents {
    'change:size': Vector3d;
    'force-update': void;
}

export class Node<Descriptor extends GraphDescriptor = GraphDescriptor> extends Point<NodeEvents> {
    public incomingLinks: Set<Link<Descriptor>> = new Set();
    public outgoingLinks: Set<Link<Descriptor>> = new Set();
    public modelIsChanged: boolean = false;
    private _size: Size;

    get id() {
        return this._model.id;
    }

    constructor(
        private _model: NodeModel<Descriptor['nodeContentType']>,
        parameters: NodeParameters = DEFAULT_NODE_PARAMETERS,
    ) {
        super(parameters);
        this._size = parameters.size || DEFAULT_NODE_PARAMETERS.size;
    }

    get data() {
        return this._model.data;
    }
    setData(data: Descriptor['nodeContentType']) {
        this._model.data = data;
        this.modelIsChanged = true;
        this.forceUpdate();
    }

    get model(): NodeModel<Descriptor['nodeContentType']> {
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
