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

export function createUUID(): string {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // tslint:disable-next-line
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        // tslint:disable-next-line
        return (c === 'x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export function isTypesEqual(types1: string[], types2: string[]): boolean {
    return types1.sort().join('') === types2.sort().join('');
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

export function distance(from: Vector3D, to: Vector3D): number {
    return Math.sqrt(
        Math.pow(from.x - to.x, 2) +
        Math.pow(from.y - to.y, 2) +
        Math.pow(from.z - to.z, 2)
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
    const dir = normalize({
        x: vector.x,
        y: 0,
        z: vector.z,
    });
    return {
        x: -vector.y * dir.x,
        y: (1 - Math.abs(vector.y)),
        z: -vector.y * dir.z,
    };
}

export function normalDown(vector: Vector3D) {
    return inverse(normalUp(vector));
}

export function normalRight(vector: Vector3D) {
    return inverse(normalLeft(vector));
}
