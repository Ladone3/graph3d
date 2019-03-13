/// <reference types="react" />
import * as THREE from 'three';
import { ReactOverlay } from '../../customization';
import { Box, Vector3d } from '../../models/structures';
import { Subscribable } from '../../utils';
import { CSS3DSprite } from '../../utils/CSS3DRenderer';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
export declare type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';
export interface OverlayAnchorEvents {
    'anchor:changed': void;
}
export declare abstract class AbstractOverlayAnchor<Model = unknown, View = unknown> extends Subscribable<OverlayAnchorEvents> {
    protected meshModel: Model;
    protected meshView: View;
    readonly html: HTMLElement;
    readonly _renderedOverlays: Map<string, HTMLElement>;
    readonly _overlayPositions: Map<string, OverlayPosition>;
    readonly sprite: CSS3DSprite;
    protected overlaysByPosition: Map<OverlayPosition, Map<string, ReactOverlay<Model>>>;
    constructor(meshModel: Model, meshView: View);
    readonly overlays: ReadonlyMap<OverlayPosition, ReadonlyMap<string, ReactOverlay<Model>>>;
    hasOverlay(overlayId: string): boolean;
    isVisible(): boolean;
    hide(): void;
    setOverlay(overlay: ReactOverlay<Model>, position: OverlayPosition): void;
    removeOverlay(id: string): void;
    update(): void;
    protected enrichOverlay(poorOverlay: ReactOverlay<Model>): ReactOverlay<Model>;
    protected overlayedGroup: (props: any) => JSX.Element;
    private redraw;
    private renderOverlay;
    abstract getModelFittingBox(): Box;
    abstract createAnchor3d(): AbstractOverlayAnchor3d<Model, View>;
}
export declare abstract class AbstractOverlayAnchor3d<Model = unknown, View = unknown> {
    protected meshModel: Model;
    protected meshView: View;
    protected overlayAnchor: AbstractOverlayAnchor<Model, View>;
    readonly mesh: THREE.Object3D;
    sprites: Rendered3dSprite[];
    constructor(meshModel: Model, meshView: View, overlayAnchor: AbstractOverlayAnchor<Model, View>);
    update(): void;
    private renderSprites;
    abstract forceUpdate(): void;
    abstract updatePosition(): void;
    abstract placeSprites(sprites: Rendered3dSprite[]): void;
}
export declare function applyOffset(basicVector: Vector3d, offset: Vector3d, position: OverlayPosition): Vector3d;
