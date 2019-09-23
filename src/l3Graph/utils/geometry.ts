import * as THREE from 'three';
import { Vector3D, Vector2D } from '../models/primitives';

export function vector3DToTreeVector3(v: Vector3D): THREE.Vector3 {
    const {x, y, z} = v;
    return new THREE.Vector3(x, y, z);
}

export function treeVector3ToVector3D(v: THREE.Vector3): Vector3D {
    const {x, y, z} = v;
    return {x, y, z};
}

export function handleDragging(
    downEvent: MouseEvent,
    onChange: (event: MouseEvent, change: Vector2D) => void,
    onEnd?: (event: MouseEvent, change: Vector2D) => void,
) {
    const startPoint = {
        x: downEvent.screenX,
        y: downEvent.screenY,
    };

    window.getSelection().removeAllRanges();

    const getOffset = (e: MouseEvent) => {
        const pp: any = e;
        const curPoint = {
            x: pp.screenX,
            y: pp.screenY,
        };

        return {
            x: curPoint.x - startPoint.x,
            y: curPoint.y - startPoint.y,
        };
    };

    const _onchange = (e: MouseEvent) => {
        onChange(e, getOffset(e));
    };

    const _onend = (e: MouseEvent) => {
        document.body.onmousemove = document.body.onmouseup = null;
        document.body.removeEventListener('mousemove', _onchange);
        document.body.removeEventListener('mouseup', _onend);
        if (onEnd) { onEnd(e, getOffset(e)); }
    };

    document.body.addEventListener('mousemove', _onchange);
    document.body.addEventListener('mouseup', _onend);
}

export function calcBounds(points: Vector3D[]) {
    const averagePos: Vector3D = {x: 0, y: 0, z: 0};
    const minPos: Vector3D = {x: Infinity, y: Infinity, z: Infinity};
    const maxPos: Vector3D = {x: -Infinity, y: -Infinity, z: -Infinity};
    for (const p of points) {
        averagePos.x += p.x;
        averagePos.y += p.y;
        averagePos.z += p.z;
        minPos.x = Math.min(minPos.x, p.x);
        minPos.y = Math.min(minPos.y, p.y);
        minPos.z = Math.min(minPos.z, p.z);
        maxPos.x = Math.max(maxPos.x, p.x);
        maxPos.y = Math.max(maxPos.y, p.y);
        maxPos.z = Math.max(maxPos.z, p.z);
    }
    averagePos.x /= points.length;
    averagePos.y /= points.length;
    averagePos.z /= points.length;

    return {
        min: minPos,
        max: maxPos,
        average: averagePos,
    };
}

export function normalize(vector: Vector3D): Vector3D {
    const norma = Math.max(
        Math.abs(vector.x),
        Math.abs(vector.y),
        Math.abs(vector.z),
    );
    return {
        x: vector.x / norma,
        y: vector.y / norma,
        z: vector.z / norma,
    };
}

export function length(from: Vector3D | Vector2D): number {
    return distance(from, {x: 0, y: 0});
}

export function vectorLength({x, y, z}: Vector3D) {
    return Math.sqrt(x * x + y * y + z * z);
}

export function distance(from: Vector3D | Vector2D, to: Vector3D | Vector2D): number {
    const from3d: Vector3D = {z: 0, ...from};
    const to3d: Vector3D = {z: 0, ...to};
    return Math.sqrt(
        Math.pow(from3d.x - to3d.x, 2) +
        Math.pow(from3d.y - to3d.y, 2) +
        Math.pow((from3d.z || 0) - to3d.z, 2)
    );
}

export function inverse(vector: Vector3D): Vector3D {
    return {
        x: -vector.x,
        y: -vector.y,
        z: -vector.z,
    };
}

export function multiply(vector: Vector3D, k: number): Vector3D {
    return {
        x: vector.x * k,
        y: vector.y * k,
        z: vector.z * k,
    };
}

export function sum(vector1: Vector3D, vector2: Vector3D): Vector3D {
    return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y,
        z: vector1.z + vector2.z,
    };
}

export function sub(vector1: Vector3D, vector2: Vector3D): Vector3D {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z,
    };
}

export function normalLeft(vector: Vector3D) {
    const hDir = normalize({
        x: vector.x,
        y: 0,
        z: vector.z,
    });
    return {
        x: hDir.z,
        y: 0,
        z: -hDir.x,
    };
}

export function normalUp(vector: Vector3D) {
    const normalL = vector3DToTreeVector3(normalLeft(vector));
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(normalL, -Math.PI / 2);

    const treeVector = vector3DToTreeVector3(vector).applyQuaternion(quaternion);
    return treeVector3ToVector3D(treeVector);
}

export function normalDown(vector: Vector3D) {
    return inverse(normalUp(vector));
}

export function normalRight(vector: Vector3D) {
    return inverse(normalLeft(vector));
}
