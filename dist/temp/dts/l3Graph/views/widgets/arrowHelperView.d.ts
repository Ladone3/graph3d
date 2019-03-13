import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { ArrowHelper } from '../../models/widgets/arrowHelper';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export interface ArrowHelperViewParameters<Descriptor extends GraphDescriptor> {
    model: ArrowHelper<Descriptor>;
}
export declare class ArrowHelperView<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    readonly model: ArrowHelper<Descriptor>;
    readonly mesh: THREE.Group;
    private boundingBox;
    constructor(parameters: ArrowHelperViewParameters<Descriptor>);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
