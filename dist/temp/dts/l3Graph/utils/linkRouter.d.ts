import { Link } from '../models/graph/link';
import { Vector3d } from '../models/structures';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export interface LinkRouter<Descriptor extends GraphDescriptor> {
    getRout(link: Link<Descriptor>): Vector3d[];
}
export declare class DefaultLinkRouter<Descriptor extends GraphDescriptor> implements LinkRouter<Descriptor> {
    private getLinkGroup;
    getRout(link: Link<Descriptor>): Vector3d[];
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
