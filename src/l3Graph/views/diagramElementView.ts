import * as THREE from 'three';
import { Element } from '../models/graphModel';

export interface DiagramElementView {
    getMesh(): THREE.Object3D | undefined;
    getOverlay(): THREE.CSS3DObject | undefined;
    getBoundingBox(): THREE.Box3;
    update(): void;
}
