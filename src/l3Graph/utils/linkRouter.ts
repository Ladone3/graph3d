import { Link, LinkModel } from '../models/graph/link';
import { Vector3d } from '../models/structures';
import { sum, multiply, normalize, sub, inverse, normalRight, normalUp, vectorLength } from './geometry';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

export interface LinkRouter<Descriptor extends GraphDescriptor> {
    getRout(link: Link<Descriptor>): Vector3d[];
}

const LINK_OFFSET = 30;

export class DefaultLinkRouter<Descriptor extends GraphDescriptor> implements LinkRouter<Descriptor> {
    private getLinkGroup(link: Link<Descriptor>): Link<Descriptor>[] {
        return Array.from(link.source.outgoingLinks).filter(l => l.target === link.target).concat(
            Array.from(link.target.outgoingLinks).filter(l => l.target === link.source)
        );
    }

    getRout(link: Link<Descriptor>): Vector3d[] {
        const group = this.getLinkGroup(link);

        const sourcePos = link.source.position;
        const targetPos = link.target.position;
        const median = multiply(sum(sourcePos, targetPos), 0.5);

        if (group.length === 1) {
            return [sourcePos, targetPos];
        } else {
            const linkIndex = group.indexOf(link);
            const groupSize = group.length;
            const inverseDirection = link.source !== group[0].source;
            const angle = (2 * Math.PI / groupSize) * (linkIndex + 1);
            // Calculate the kink point
            const originalDirection = normalize(sub(sourcePos, targetPos));
            const direction = inverseDirection ? inverse(originalDirection) : originalDirection;
            const dirRight = normalRight(direction);
            const dirUp = normalUp(direction);
            const offsetDir = normalize(sum(
                multiply(dirRight, Math.cos(angle)),
                multiply(dirUp, Math.sin(angle)),
            ));
            const offset = multiply(offsetDir, groupSize > 1 ? LINK_OFFSET : 0);
            const kinkPoint = sum(median, offset);
            return [sourcePos, kinkPoint, targetPos];
        }
    }
}

/**
 * @param polyline
 * @param offset from 0 to 1
 */
export function getPointAlongPolylineByRatio(polyline: ReadonlyArray<Vector3d>, ratio: number): Vector3d {
    const length = computePolylineLength(polyline);
    return getPointAlongPolyline(polyline, length * ratio);
}

/**
 * @param polyline
 * @param offset from 0 to length of polyline
 */
export function getPointAlongPolyline(polyline: ReadonlyArray<Vector3d>, offset: number): Vector3d {
    if (polyline.length === 0) {
        throw new Error('Cannot compute a point for empty polyline!');
    }
    if (offset < 0) {
        return polyline[0];
    }
    let currentOffset = 0;
    for (let i = 1; i < polyline.length; i++) {
        const previous = polyline[i - 1];
        const point = polyline[i];
        const segment = {x: point.x - previous.x, y: point.y - previous.y, z: point.z - previous.z};
        const segmentLength = vectorLength(segment);
        const newOffset = currentOffset + segmentLength;
        if (offset < newOffset) {
            const leftover = (offset - currentOffset) / segmentLength;
            return {
                x: previous.x + leftover * segment.x,
                y: previous.y + leftover * segment.y,
                z: previous.z + leftover * segment.z,
            };
        } else {
            currentOffset = newOffset;
        }
    }
    return polyline[polyline.length - 1];
}

export function computePolylineLength(polyline: ReadonlyArray<Vector3d>): number {
    let previous: Vector3d;
    return polyline.reduce((acc, point) => {
        const segmentLength = previous ? vectorLength({
            x: point.x - previous.x,
            y: point.y - previous.y,
            z: point.z - previous.z,
        }) : 0;
        previous = point;
        return acc + segmentLength;
    }, 0);
}
