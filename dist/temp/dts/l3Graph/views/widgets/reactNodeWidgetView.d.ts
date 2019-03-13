import * as THREE from 'three';
import { FocusNodeWidget } from '../../models/widgets/focusNodeWidget';
import { OverlayPosition } from '../graph/overlayAnchor';
import { Node } from '../../models/graph/node';
import { ReactOverlay } from '../../customization';
import { DiagramWidgetView } from '../viewInterface';
import { DiagramView } from '../diagramView';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export interface ReactNodeWidgetViewParameters<Descriptor extends GraphDescriptor> {
    diagramView: DiagramView<Descriptor>;
    model: FocusNodeWidget<Descriptor>;
    overlay: ReactOverlay<Node<Descriptor>>;
    position?: OverlayPosition;
}
export declare class ReactNodeWidgetView<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    readonly model: FocusNodeWidget<Descriptor>;
    readonly mesh: THREE.Group;
    private htmlOverlay;
    private overlay;
    private position;
    private diagramView;
    constructor(parameters: ReactNodeWidgetViewParameters<Descriptor>);
    getBoundingBox(): THREE.Box3;
    update(): void;
    onRemove(): void;
    private clearNode;
}
