import * as THREE from 'three';
import { Node } from '../../models/graph/node';
import { ViewTemplate, ReactOverlay } from '../../customization';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { View } from '../viewInterface';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export declare class NodeView<Descriptor extends GraphDescriptor> implements View<Node<Descriptor>> {
    readonly model: Node<Descriptor>;
    readonly mesh: THREE.Object3D;
    readonly overlayAnchor: NodeOverlayAnchor<Descriptor>;
    readonly overlayAnchor3d: NodeOverlayAnchor3d<Descriptor>;
    private boundingBox;
    private meshOriginalSize;
    private meshOffset;
    private preserveRatio;
    constructor(model: Node<Descriptor>, template: ViewTemplate<Node<Descriptor>>);
    getBoundingBox(): THREE.Box3;
    update(): void;
    private calcScale;
}
export declare class NodeOverlayAnchor<Descriptor extends GraphDescriptor> extends AbstractOverlayAnchor<Node<Descriptor>, NodeView<Descriptor>> {
    getModelFittingBox(): {
        width: number;
        height: number;
        deep: number;
        x: number;
        y: number;
        z: number;
    };
    protected enrichOverlay(poorOverlay: ReactOverlay<Node<Descriptor>>): ReactOverlay<Node<Descriptor>>;
}
export declare class NodeOverlayAnchor3d<Descriptor extends GraphDescriptor> extends AbstractOverlayAnchor3d<Node<Descriptor>, NodeView<Descriptor>> {
    forceUpdate(): void;
    updatePosition(): void;
    placeSprites(renderedSprites: Rendered3dSprite[]): void;
}
