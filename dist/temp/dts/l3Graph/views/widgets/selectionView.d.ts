import * as THREE from 'three';
import { SelectionWidget } from '../../models/widgets/selectionWidget';
import { DiagramWidgetView } from '../viewInterface';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export declare const SELECTION_PADDING = 5;
export interface SelectionViewParameters<Descriptor extends GraphDescriptor> {
    model: SelectionWidget<Descriptor>;
}
export declare class SelectionView<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    readonly material: THREE.MeshLambertMaterial;
    readonly geometry: THREE.BoxGeometry;
    readonly mesh: THREE.Mesh;
    readonly model: SelectionWidget<Descriptor>;
    private boundingBox;
    constructor(parameters: SelectionViewParameters<Descriptor>);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
