import * as THREE from 'three';
import { Link } from '../models/link';
import { Node } from '../models/node';
import { OverlayAnchor } from './overlayAnchor';
import { Widget } from '../models/widgets';

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
