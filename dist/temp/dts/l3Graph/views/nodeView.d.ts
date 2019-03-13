import * as THREE from 'three';
import { Node } from '../models/node';
import { DiagramElementView } from './diagramElementView';
import { NodeViewTemplate } from '../templates';
export declare const DEFAULT_SCALE = 20;
export declare class NodeView implements DiagramElementView<Node> {
    readonly model: Node;
    readonly mesh: THREE.Object3D;
    readonly overlay: THREE.CSS3DSprite;
    private boundingBox;
    private meshOffset;
    private htmlOverlay;
    private htmlBody;
    constructor(model: Node, customTemplate?: NodeViewTemplate);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
