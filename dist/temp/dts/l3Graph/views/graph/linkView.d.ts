/// <reference types="react" />
import * as THREE from 'three';
import { Link } from '../../models/graph/link';
import { LinkViewTemplate } from '../../customization';
import { Vector3d } from '../../models/structures';
import { AbstractOverlayAnchor, AbstractOverlayAnchor3d } from './overlayAnchor';
import { LinkRouter } from '../../utils/linkRouter';
import { View } from '../viewInterface';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
export declare class LinkView implements View<Link> {
    readonly model: Link;
    readonly router: LinkRouter;
    private template;
    readonly mesh: THREE.Group;
    readonly overlayAnchor: LinkOverlayAnchor;
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
    createAnchor3d(): LinkOverlayAnchor3d;
}
export declare class LinkOverlayAnchor3d extends AbstractOverlayAnchor3d<Link, LinkView> {
    forceUpdate(): void;
    updatePosition(): void;
    placeSprites(renderedSprites: Rendered3dSprite[]): void;
}
