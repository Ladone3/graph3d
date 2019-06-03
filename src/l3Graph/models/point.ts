import { Vector3D } from './primitives';
import { Subscribable } from '../utils/subscribeable';

export interface PointParameters {
    position: Vector3D;
}

export interface PointEvents {
    'change:position': Vector3D;
    'force-update': void;
}

export abstract class Point<Events extends PointEvents = PointEvents> extends Subscribable<Events> {
    public readonly id: string;
    protected _position: Vector3D;

    constructor(parameters: PointParameters) {
        super();
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
}
