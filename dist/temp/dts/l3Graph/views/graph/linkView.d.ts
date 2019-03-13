/// <reference types="react" />
import * as THREE from 'three';
import { Link } from '../../models/graph/link';
import { LinkViewTemplate } from '../../customization';
import { Vector3d } from '../../models/structures';
import { AbstractOverlayAnchor } from './overlayAnchor';
import { LinkRouter } from '../../utils/linkRouter';
import { DiagramElementView } from '../viewInterface';
import { AbstractOverlayAnchor3d } from './overlay3DAnchor';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
export declare class LinkView implements DiagramElementView {
    readonly model: Link;
    readonly router: LinkRouter;
    private template;
    readonly mesh: THREE.Group;
    readonly overlayAnchor: LinkOverlayAnchor;
    readonly overlayAnchor3d: LinkOverlayAnchor3d;
    polyline: Vector3d[];
    private lines;
    private arrowGeometry;
    private arrowMaterial;
    private arrow;
    private boundingBox;
    constructor(model: Link, router: LinkRouter, template: LinkViewTemplate);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
export declare class LinkOverlayAnchor extends AbstractOverlayAnchor<Link, LinkView> {
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
export declare class LinkOverlayAnchor3d extends AbstractOverlayAnchor3d<Link, LinkView> {
    forceUpdate(): void;
    updatePosition(): void;
    placeSprites(renderedSprites: Rendered3dSprite[]): void;
}
