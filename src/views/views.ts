import * as THREE from 'three';

export interface GraphElementView {
    getMesh(): THREE.Mesh | THREE.Line;
    update(): void;
}
