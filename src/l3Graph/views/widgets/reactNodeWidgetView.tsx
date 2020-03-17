import * as THREE from 'three';

import { FocusNodeWidget } from '../../models/widgets/focusNodeWidget';
import { OverlayPosition } from '../graph/overlayAnchor';
import { Node } from '../../models/graph/node';

import { ReactOverlay } from '../../customization';
import { DiagramWidgetView } from '../viewInterface';
import { DiagramView } from '../diagramView';

export interface ReactNodeWidgetViewParameters {
    diagramView: DiagramView;
    model: FocusNodeWidget;
    overlay: ReactOverlay;
    position?: OverlayPosition;
}

export class ReactNodeWidgetView implements DiagramWidgetView {
    public readonly model: FocusNodeWidget;
    public readonly mesh: THREE.Group;

    private htmlOverlay: HTMLElement;
    private overlay: ReactOverlay;
    private position: OverlayPosition;
    private diagramView: DiagramView;

    constructor(parameters: ReactNodeWidgetViewParameters) {
        this.model = parameters.model;
        this.position = parameters.position || 'c';
        this.mesh = null;
        this.diagramView = parameters.diagramView;
        this.overlay = parameters.overlay;

        this.htmlOverlay = document.createElement('DIV');

        this.update();
    }

    public getBoundingBox(): THREE.Box3 {
        return new THREE.Box3();
    }

    public update() {
        if (!this.model.isFocusNodeChanged) {
            return;
        }
        this.clearNode(this.model.prevFocusNode);

        if (this.model.focusNode) {
            const curAnchor = this.diagramView.graphView.nodeViews.get(this.model.focusNode.id).overlayAnchor;
            if (!curAnchor.hasOverlay(this.overlay.id)) {
                curAnchor.setOverlay(this.overlay, this.position);
            }
        }
    }

    onRemove() {
        this.clearNode(this.model.focusNode);
        this.clearNode(this.model.prevFocusNode);
    }

    private clearNode(node: Node) {
        if (node && this.overlay) {
            const view = this.diagramView.graphView.nodeViews.get(node.id);
            if (view) {
                const anchor = this.diagramView.graphView.nodeViews.get(node.id).overlayAnchor;
                anchor.removeOverlay(this.overlay.id);
            }
        }
    }
}
