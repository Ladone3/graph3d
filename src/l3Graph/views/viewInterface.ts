import * as THREE from 'three';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { OverlayAnchor } from './graph/overlayAnchor';
import { Widget } from '../models/widgets/widget';

export interface View<Model = any> {
    readonly mesh: THREE.Object3D | null;
    readonly overlayAnchor: OverlayAnchor;
    getBoundingBox(): THREE.Box3;
    update(): void;
    onRemove?(): void;
    model: Model;
}

export type DiagramElementView = View<Node | Link>;
export type DiagramWidgetView = View<Widget>;
