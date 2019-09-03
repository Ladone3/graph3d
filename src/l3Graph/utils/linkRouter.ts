import { Link, LinkModel } from '../models/link';
import { Vector3D } from '../models/primitives';
import { vectorLength, multiply, sum, normalize, sub, inverse, normalRight, normalUp } from '.';
import { GraphModel } from '../models/graphModel';

export interface LinkRouter {
    getRout(link: Link): Vector3D[];
}

const LINK_OFFSET = 30;

export class DefaultLinkRouter implements LinkRouter {
    constructor(
        private graphModel: GraphModel
    ) { }
    
    private getLinkNeighbours(link: Link): Link[] {
        return Array.from(link.source.outgoingLinks).filter(l => l.target === link.target).concat(
            Array.from(link.target.outgoingLinks).filter(l => l.target === link.source)
        );
    }

    getRout(link: Link): Vector3D[] {
        const group = this.getLinkNeighbours(link);

        const sourcePos = link.source.position;
        const targetPos = link.target.position;
        const mediana = multiply(sum(sourcePos, targetPos), 0.5);

        let overlayPosition: Vector3D;
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
            const kinkPoint = sum(mediana, offset);
            return [sourcePos, kinkPoint, targetPos];
        }
    }
}

function getGroupId(link: LinkModel): string {
    return `${[link.sourceId, link.targetId].sort().join('<==>')}`;
}

/**
 * @param polyline
 * @param offset from 0 to 1
 */
export function getPointAlongPolylineByRatio(polyline: ReadonlyArray<Vector3D>, ratio: number): Vector3D {
    const length = computePolylineLength(polyline);
    return getPointAlongPolyline(polyline, length * ratio);
}

/**
 * @param polyline
 * @param offset from 0 to length of polyline
 */
export function getPointAlongPolyline(polyline: ReadonlyArray<Vector3D>, offset: number): Vector3D {
    if (polyline.length === 0) {
        throw new Error('Cannot compute a point for empty polyline');
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

export function computePolylineLength(polyline: ReadonlyArray<Vector3D>): number {
    let previous: Vector3D;
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