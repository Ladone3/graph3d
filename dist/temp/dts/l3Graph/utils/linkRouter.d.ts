import { Link } from '../models/graph/link';
import { Vector3d } from '../models/structures';
export interface LinkRouter {
    getRout(link: Link): Vector3d[];
}
export declare class DefaultLinkRouter implements LinkRouter {
    private getLinkNeighbours;
    getRout(link: Link): Vector3d[];
}
/**
 * @param polyline
 * @param offset from 0 to 1
 */
export declare function getPointAlongPolylineByRatio(polyline: ReadonlyArray<Vector3d>, ratio: number): Vector3d;
/**
 * @param polyline
 * @param offset from 0 to length of polyline
 */
export declare function getPointAlongPolyline(polyline: ReadonlyArray<Vector3d>, offset: number): Vector3d;
export declare function computePolylineLength(polyline: ReadonlyArray<Vector3d>): number;
