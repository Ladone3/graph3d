import * as THREE from 'three';
import { Link } from '../models/link';
import { Node } from '../models/node';
import { OverlayAnchor } from './overlayAnchor';
import { GraphView } from './graphView';

export interface View {
    readonly mesh: THREE.Object3D | null;
    readonly overlayAnchor: OverlayAnchor;
    getBoundingBox(): THREE.Box3;
    update(): void;
}

export interface DiagramElementView extends View {
    model: Node | Link;
}

export interface DiagramWidgetViewParameters {
    graphView: GraphView;
}

export abstract class DiagramWidgetView implements View {
    readonly mesh: THREE.Object3D | null;
    readonly overlayAnchor: OverlayAnchor;

    abstract getBoundingBox(): THREE.Box3;
    abstract update(): void;

    protected graphView: GraphView;

    constructor(parameters: DiagramWidgetViewParameters) {
        this.graphView = parameters.graphView;
    }
}
