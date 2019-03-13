import * as THREE from 'three';
import { FocusNodeWidget } from '../../models/widgets/focusNodeWidget';
import { OverlayPosition } from '../graph/overlayAnchor';
import { ReactOverlay } from '../../customization';
import { DiagramWidgetView } from '../viewInterface';
import { DiagramView } from '../diagramView';
export interface ReactNodeWidgetViewParameters {
    diagramView: DiagramView;
    model: FocusNodeWidget;
    overlay: ReactOverlay;
    position?: OverlayPosition;
}
export declare class ReactNodeWidgetView implements DiagramWidgetView {
    readonly model: FocusNodeWidget;
    readonly mesh: THREE.Group;
    private htmlOverlay;
    private overlay;
    private position;
    private diagramView;
    constructor(parameters: ReactNodeWidgetViewParameters);
    getBoundingBox(): THREE.Box3;
    update(): void;
    onRemove(): void;
    private clearNode;
}
