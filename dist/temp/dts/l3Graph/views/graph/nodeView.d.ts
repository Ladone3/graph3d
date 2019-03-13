import * as THREE from 'three';
import { Node } from '../../models/graph/node';
import { ViewTemplate, ReactOverlay } from '../../customization';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { View } from '../viewInterface';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export declare class NodeView implements View<Node> {
    readonly model: Node;
    readonly mesh: THREE.Object3D;
    readonly overlayAnchor: NodeOverlayAnchor;
    readonly overlayAnchor3d: NodeOverlayAnchor3d;
    private boundingBox;
    private meshOriginalSize;
    private meshOffset;
    private preserveRatio;
    constructor(model: Node, template: ViewTemplate<Node>);
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
    protected enrichOverlay(poorOverlay: ReactOverlay<Node>): ReactOverlay<Node<GraphDescriptor<unknown, unknown>>>;
}
export declare class NodeOverlayAnchor3d extends AbstractOverlayAnchor3d<Node, NodeView> {
    forceUpdate(): void;
    updatePosition(): void;
    placeSprites(renderedSprites: Rendered3dSprite[]): void;
}
