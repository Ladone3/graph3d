import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { Selection } from '../models/selection';
export declare class SelectionView implements DiagramElementView<Selection> {
    readonly model: Selection;
    readonly material: THREE.MeshLambertMaterial;
    readonly geometry: THREE.CubeGeometry;
    readonly mesh: THREE.Group;
    readonly overlay: THREE.CSS3DObject | null;
    private boundingBox;
    constructor(model: Selection);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
