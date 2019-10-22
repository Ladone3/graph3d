import * as THREE from 'three';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { AbstractOverlayAnchor } from './graph/overlayAnchor';
import { Widget } from '../models/widgets/widget';
import { AbstracrOverlayAnchor3d } from './graph/overlay3DAnchor';

export interface View<Model = any> {
    readonly mesh: THREE.Object3D | null;
    readonly overlayAnchor3d?: AbstracrOverlayAnchor3d<Model, View>;
    readonly overlayAnchor?: AbstractOverlayAnchor<Model, View>;
    getBoundingBox(): THREE.Box3;
    update(): void;
    onRemove?(): void;
    model: Model;
}

export type DiagramElementView = View<Node | Link>;
export type DiagramWidgetView = View<Widget>;
