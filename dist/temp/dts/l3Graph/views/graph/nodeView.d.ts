import * as THREE from 'three';
import { Node } from '../../models/graph/node';
import { NodeViewTemplate, ReactOverlay } from '../../customisation';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { DiagramElementView } from '../viewInterface';
import { AbstracrOverlayAnchor3d } from './overlay3DAnchor';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
export declare class NodeView implements DiagramElementView {
    readonly model: Node;
    readonly mesh: THREE.Object3D;
    readonly overlayAnchor: NodeOverlayAnchor;
    readonly overlayAnchor3d: NodeOverlayAnchor3d;
    private boundingBox;
    private meshOriginalSize;
    private meshOffset;
    private preserveRatio;
    constructor(model: Node, template: NodeViewTemplate);
    getBoundingBox(): THREE.Box3;
    update(): void;
    private calcScale;
}
export declare class NodeOverlayAnchor extends AbstractOverlayAnchor<Node, NodeView> {
    getModelFittingBox(): {
        width: number;
        height: number;
        deep: number;
        x: number;
        y: number;
        z: number;
    };
    protected enrichOverlay(pooreOverlay: ReactOverlay): ReactOverlay;
}
export declare class NodeOverlayAnchor3d extends AbstracrOverlayAnchor3d<Node, NodeView> {
    forceUpdate(): void;
    updatePosition(): void;
    placeSprites(renderedSprites: Rendered3dSprite[]): void;
}
