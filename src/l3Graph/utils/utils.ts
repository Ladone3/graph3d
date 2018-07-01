import * as THREE from 'three';

import { Vector3D, Vector2D } from '../models/primitives';

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
