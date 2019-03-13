/// <reference types="react" />
import * as THREE from 'three';
import { ReactOverlay } from '../../customisation';
import { Box } from '../../models/structures';
import { Subscribable } from '../../utils';
export declare type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';
export interface OverlayAnchorEvents {
    'anchor:changed': void;
}
export declare abstract class AbstractOverlayAnchor<Model, View> extends Subscribable<OverlayAnchorEvents> {
    protected meshModel: Model;
    protected meshView: View;
    readonly html: HTMLElement;
    readonly _renderedOverlays: Map<string, HTMLElement>;
    readonly _overlayPositions: Map<string, OverlayPosition>;
    readonly sprite: THREE.CSS3DSprite;
    protected overlaysByPosition: Map<OverlayPosition, Map<string, ReactOverlay>>;
    constructor(meshModel: Model, meshView: View);
    readonly overlays: ReadonlyMap<OverlayPosition, ReadonlyMap<string, ReactOverlay>>;
    hasOverlay(owelrayId: string): boolean;
    isVisible(): boolean;
    hide(): void;
    setOverlay(overlay: ReactOverlay, position: OverlayPosition): void;
    removeOverlay(id: string): void;
    update(): void;
    protected enrichOverlay(pooreOverlay: ReactOverlay): ReactOverlay;
    protected overlayedGroup: (props: any) => JSX.Element;
    private redraw;
    private renderOverlay;
    abstract getModelFittingBox(): Box;
}
