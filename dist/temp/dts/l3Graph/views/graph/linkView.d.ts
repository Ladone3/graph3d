/// <reference types="react" />
import * as THREE from 'three';
import { Link } from '../../models/graph/link';
import { LinkViewTemplate } from '../../customization';
import { Vector3d } from '../../models/structures';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { LinkRouter } from '../../utils/linkRouter';
import { View } from '../viewInterface';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export declare class LinkView<Descriptor extends GraphDescriptor = GraphDescriptor> implements View<Link<Descriptor>> {
    readonly model: Link<Descriptor>;
    readonly router: LinkRouter;
    private template;
    readonly mesh: THREE.Group;
    readonly overlayAnchor: LinkOverlayAnchor<Descriptor>;
    readonly overlayAnchor3d: LinkOverlayAnchor3d<Descriptor>;
    polyline: Vector3d[];
    private lines;
    private arrowGeometry;
    private arrowMaterial;
    private arrow;
    private boundingBox;
    constructor(model: Link<Descriptor>, router: LinkRouter, template: LinkViewTemplate<Descriptor>);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
export declare class LinkOverlayAnchor<Descriptor extends GraphDescriptor> extends AbstractOverlayAnchor<Link<Descriptor>, LinkView<Descriptor>> {
    getModelFittingBox(): {
        x: number;
        y: number;
        z: number;
        width: number;
        height: number;
        deep: number;
    };
    protected overlayedGroup: (props: any) => JSX.Element;
}
export declare class LinkOverlayAnchor3d<Descriptor extends GraphDescriptor> extends AbstractOverlayAnchor3d<Link<Descriptor>, LinkView<Descriptor>> {
    forceUpdate(): void;
    updatePosition(): void;
    placeSprites(renderedSprites: Rendered3dSprite[]): void;
}
