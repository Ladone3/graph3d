import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';

import { DiagramWidgetView, DiagramWidgetViewParameters } from '.';
import { ReactNodeWidget } from '../models/widgets/reactNodeWidget';
import { OverlayAnchor, MockOverlayAnchor, PositionedReactOverlay } from './overlayAnchor';

export interface ReactNodeWidgetViewParameters extends DiagramWidgetViewParameters {
    model: ReactNodeWidget;
}

export class ReactNodeWidgetView extends DiagramWidgetView {
    public readonly model: ReactNodeWidget;
    public readonly mesh: THREE.Group;
    public readonly overlayAnchor: OverlayAnchor;

    private htmlOverlay: HTMLElement;
    private curOverlay: PositionedReactOverlay;

    constructor(parameters: ReactNodeWidgetViewParameters) {
        super(parameters);
        this.model = parameters.model;
        this.mesh = null;

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
        if (this.model.prevFocusNode && this.curOverlay) {
            const prevView = this.graphView.views.get(
                this.model.prevFocusNode.id,
            );
            if (prevView) {
                const prevAnchor = this.graphView.views.get(
                    this.model.prevFocusNode.id,
                ).overlayAnchor;
                prevAnchor.removeOverlay(this.curOverlay);
            }
        }

        if (this.model.focusNode) {
            const curAnchor = this.graphView.views.get(
                this.model.focusNode.id,
            ).overlayAnchor;
            if (!this.curOverlay || this.curOverlay && !curAnchor.hasOverlay(this.curOverlay)) {
                const positionedOverlay: PositionedReactOverlay = {
                    position: 'w',
                    overlay: this.model.overlay,
                };
                curAnchor.attachOverlay(positionedOverlay);
                this.curOverlay = positionedOverlay;
            }
        } else {
            this.curOverlay = undefined;
        }
    }
}
