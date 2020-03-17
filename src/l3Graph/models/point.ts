import { Vector3d } from './structures';
import { Subscribable } from '../utils';

export type PointId = String & { pointPlaceholder?: boolean };

export interface PointParameters {
    position: Vector3d;
}

export interface PointEvents {
    'change:position': Vector3d;
}

export abstract class Point<Events extends PointEvents = PointEvents> extends Subscribable<Events> {
    public readonly id: PointId;
    protected _position: Vector3d;

    constructor(parameters: PointParameters) {
        super();
        this._position = parameters.position;
    }

    get position() {
        return this._position;
    }
    setPosition(position: Vector3d) {
        const previous = this._position;
        this._position = position;
        this.trigger('change:position', previous);
    }
}
