import * as THREE from 'three';

export interface DiagramElementView<Model> {
    model: Model;
    readonly mesh: THREE.Object3D | null;
    readonly overlay: THREE.CSS3DObject | null;
    getBoundingBox(): THREE.Box3;
    update(): void;
}
