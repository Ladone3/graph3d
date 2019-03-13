import * as THREE from 'three';
import { SelectionWidget } from '../../models/widgets/selectionWidget';
import { DiagramWidgetView } from '../viewInterface';
export declare const SELECTION_PADDING = 5;
export interface SelectionViewParameters {
    model: SelectionWidget;
}
export declare class SelectionView implements DiagramWidgetView {
    readonly material: THREE.MeshLambertMaterial;
    readonly geometry: THREE.CubeGeometry;
    readonly mesh: THREE.Group;
    readonly model: SelectionWidget;
    private boundingBox;
    constructor(parameters: SelectionViewParameters);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
