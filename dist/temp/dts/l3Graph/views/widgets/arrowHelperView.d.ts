import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { ArrowHelper } from '../../models/widgets/arrowHelper';
export interface ArrowHelperViewParameters {
    model: ArrowHelper;
}
export declare class ArrowHelperView implements DiagramWidgetView {
    readonly model: ArrowHelper;
    readonly mesh: THREE.Group;
    private boundingBox;
    constructor(parameters: ArrowHelperViewParameters);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
