import * as THREE from 'three';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { AbstractOverlayAnchor } from './graph/overlayAnchor';
import { Widget } from '../models/widgets/widget';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

export interface View<Model> {
    readonly mesh: THREE.Object3D | null;
    readonly overlayAnchor?: AbstractOverlayAnchor<Model, View<Model>>;
    getBoundingBox(): THREE.Box3;
    update(): void;
    onRemove?(): void;
    model: Model;
}

export type DiagramElementView = (
    View<Node> | View<Link>
);
export type DiagramWidgetView = View<Widget>;
