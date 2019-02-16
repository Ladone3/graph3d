import * as THREE from 'three';
import { Vector3D, Vector2D } from '../models/primitives';

export * from './colorUtils';
export * from './keyHandler';
export * from './shapeUtils';
export * from './subscribeable';

export function distance(from: Vector3D, to: Vector3D): number {
    return Math.sqrt(
        Math.pow(from.x - to.x, 2) +
        Math.pow(from.y - to.y, 2) +
        Math.pow(from.z - to.z, 2)
    );
}

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
    onEnd?: () => void,
) {
    const startPoint = {
        x: downEvent.screenX,
        y: downEvent.screenY,
    };

    window.getSelection().removeAllRanges();

    const _onchange = (e: MouseEvent) => {
        const pp: any = e;

        const curPoint = {
            x: pp.screenX,
            y: pp.screenY,
        };

        const offset = {
            x: curPoint.x - startPoint.x,
            y: curPoint.y - startPoint.y,
        };

        onChange(e, offset);
    };

    const _onend = () => {
        document.body.onmousemove = document.body.onmouseup = null;
        document.body.removeEventListener('mousemove', _onchange);
        document.body.removeEventListener('mouseup', _onend);
        if (onEnd) { onEnd(); }
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
