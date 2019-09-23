import * as THREE from 'three';

import { DiagramWidgetView } from '.';
import { FocusNodeWidget } from '../models/widgets/focusNodeWidget';
import { OverlayAnchor, MockOverlayAnchor, OverlayPosition } from './overlayAnchor';
import { Node } from '../models/node';
import { GraphView } from './graphView';
import { ReactOverlay } from '../customisation';

export interface ReactNodeWidgetViewParameters {
    graphView: GraphView;
    model: FocusNodeWidget;
    overlay: ReactOverlay;
    position?: OverlayPosition;
}

export class ReactNodeWidgetView implements DiagramWidgetView {
    public readonly model: FocusNodeWidget;
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: OverlayAnchor;

    private htmlOverlay: HTMLElement;
    private overlay: ReactOverlay;
    private position: OverlayPosition;
    private graphView: GraphView;

    constructor(parameters: ReactNodeWidgetViewParameters) {
        this.model = parameters.model;
        this.position = parameters.position || 'c';
        this.mesh = null;
        this.graphView = parameters.graphView;
        this.overlay = parameters.overlay;

        this.htmlOverlay = document.createElement('DIV');
        this.overlayAnchor = new MockOverlayAnchor();

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
            const curAnchor = this.graphView.views.get(this.model.focusNode.id).overlayAnchor;
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
            const view = this.graphView.views.get(node.id);
            if (view) {
                const anchor = this.graphView.views.get(node.id).overlayAnchor;
                anchor.removeOverlay(this.overlay.id);
            }
        }
    }
}
