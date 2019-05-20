import { Vector3D } from './primitives';
import { uniqueId } from 'lodash';
import { Subscribable } from '../utils/subscribeable';
import { Link } from './link';
import { isTypesEqual } from '../utils';

export const DEFAULT_NODE_TYPE_ID = 'o3d-node';
export const DEFAULT_NODE_SIZE: Vector3D = { x: 15, y: 15, z: 15 };

export interface PointParameters {
    id?: string;
    position: Vector3D;
}

export interface PointEvents {
    'change:position': Vector3D;
    'force-update': void;
    'remove': void;
}

export class Point<Events extends PointEvents = PointEvents> extends Subscribable<Events> {
    public readonly id: string;
    protected _position: Vector3D;

    constructor(parameters: PointParameters) {
        super();

        this.id = parameters.id || uniqueId('Point-');
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

    forceUpdate() {
        this.trigger('force-update');
    }

    remove() {
        this.trigger('remove');
    }
}
