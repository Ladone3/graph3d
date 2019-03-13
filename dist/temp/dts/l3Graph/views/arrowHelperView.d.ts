import * as THREE from 'three';
import { DiagramElementView } from './diagramElementView';
import { ArrowHelper } from '../models/arrowHelper';
export declare class ArrowHelperView implements DiagramElementView<ArrowHelper> {
    readonly model: ArrowHelper;
    readonly mesh: THREE.Group;
    readonly overlay: THREE.CSS3DObject | null;
    private boundingBox;
    constructor(model: ArrowHelper);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
