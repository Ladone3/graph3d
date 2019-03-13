import { Vector3d } from './structures';
import { Subscribable } from '../utils';
export declare type PointId = string & {
    pointPlaceholder?: boolean;
};
export interface PointParameters {
    position: Vector3d;
}
export interface PointEvents {
    'change:position': Vector3d;
}
export declare abstract class Point<Events extends PointEvents = PointEvents> extends Subscribable<Events> {
    readonly id: PointId;
    protected _position: Vector3d;
    constructor(parameters: PointParameters);
    readonly position: Vector3d;
    setPosition(position: Vector3d): void;
}
