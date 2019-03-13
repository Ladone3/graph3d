import * as THREE from 'three';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { AbstractOverlayAnchor } from './graph/overlayAnchor';
import { Widget } from '../models/widgets/widget';
import { AbstractOverlayAnchor3d } from './graph/overlay3DAnchor';
export interface View<Model> {
    readonly mesh: THREE.Object3D | null;
    readonly overlayAnchor3d?: AbstractOverlayAnchor3d<Model, View<Model>>;
    readonly overlayAnchor?: AbstractOverlayAnchor<Model, View<Model>>;
    getBoundingBox(): THREE.Box3;
    update(): void;
    onRemove?(): void;
    model: Model;
}
export declare type DiagramElementView = (View<Node> | View<Link>);
export declare type DiagramWidgetView = View<Widget>;
