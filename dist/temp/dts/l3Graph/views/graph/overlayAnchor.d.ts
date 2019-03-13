/// <reference types="react" />
import { ReactOverlay } from '../../customization';
import { Box } from '../../models/structures';
import { Subscribable } from '../../utils';
import { CSS3DSprite } from '../../utils/CSS3DRenderer';
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
}
