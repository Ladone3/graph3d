import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { ReactOverlay, createContextProvider, enrichOverlay } from '../../customisation';
import { Box } from '../../models/structures';
import { Subscribable } from '../../utils';

export type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';

export interface OverlayAnchorEvents {
    'anchor:changed': void;
}

// todo: verify again the functions list - not everything is clear here
export abstract class AbstractOverlayAnchor<Model, View> extends Subscribable<OverlayAnchorEvents> {
    readonly html: HTMLElement;
    readonly _renderedOverlays = new Map<string, HTMLElement>();
    readonly _overlayPositions: Map<string, OverlayPosition>;
    readonly sprite: THREE.CSS3DSprite;
    protected overlaysByPosition: Map<OverlayPosition, Map<string, ReactOverlay>>;

    constructor(
        protected meshModel: Model,
        protected meshView: View,
    ) {
        super();
        this.html = document.createElement('DIV');
        this.sprite = new THREE.CSS3DSprite(this.html);
        this.overlaysByPosition = new Map();
        this._overlayPositions = new Map();
    }

    get overlays(): ReadonlyMap<OverlayPosition, ReadonlyMap<string, ReactOverlay>> {
        return this.overlaysByPosition
    }

    hasOverlay(owelrayId: string): boolean {
        return this._overlayPositions.has(owelrayId);
    }

    isVisible() {
        return this.overlaysByPosition.size > 0;
    }

    hide() {
        this._overlayPositions.forEach((p, id) => {
            this.removeOverlay(id);
        });
    }

    setOverlay(overlay: ReactOverlay, position: OverlayPosition) {
        if (!this.overlaysByPosition.has(position)) {
            this.overlaysByPosition.set(position, new Map());
        }
        this.overlaysByPosition.get(position).set(overlay.id, overlay);
        this._overlayPositions.set(overlay.id, position);
        this.redraw();
        this.trigger('anchor:changed');
    }

    removeOverlay(id: string) {
        if (!this.hasOverlay(id)) { return; }
        const position = this._overlayPositions.get(id);
        const overlaysOnPosition = this.overlaysByPosition.get(position);
        overlaysOnPosition.delete(id);
        if (overlaysOnPosition.size === 0) {
            this.overlaysByPosition.delete(position);
        }
        this._overlayPositions.delete(id);
        this._renderedOverlays.delete(id);
        this.redraw();
        this.trigger('anchor:changed');
    }

    update() {
        if (this.overlaysByPosition.size > 0) {
            const {x, y, z} = this.getModelFittingBox();
            this.sprite.position.set(x, y, z);
        }
    }

    protected enrichOverlay(pooreOverlay: ReactOverlay): ReactOverlay {
        return enrichOverlay(pooreOverlay, this.meshModel);
    }

    protected overlayedGroup = (props: any) => {
        return <div
            key={`overlay-group-${props.position}`}
            className={`l3g-html-overlay l3g-position-${props.position}`}>
                <div className='l3g-html-overlay-aligner'>
                    <div className='l3g-html-overlay__body'>
                        {props.children}
                    </div>
                </div>
        </div>;
    }

    private redraw() {
        const OverlayedGroup = this.overlayedGroup;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.html);
        } else {
            const overlayGroups: JSX.Element[] = [];
            this.overlaysByPosition.forEach((overlays, position) => {
                const overlayViews: JSX.Element[] = [];
                overlays.forEach(poorOverlay => {
                    overlayViews.push(<div ref={(ref => this._renderedOverlays.set(poorOverlay.id, ref))}>
                        {this.renderOverlay(poorOverlay, position)}
                    </div>);
                });
                overlayGroups.push(<OverlayedGroup position={position}>{overlayViews}</OverlayedGroup>);
            });

            const {x, y, z, width, height} = this.getModelFittingBox();
            this.sprite.position.set(x, y, z);

            ReactDOM.render(
                <div
                    className='l3g-node-overlay-anchor'
                    style={{width, height}}>
                    {overlayGroups}
                </div>,
                this.html,
            );
        }
    }

    private renderOverlay(poorOverlay: ReactOverlay, position: OverlayPosition) {
        const overlay = this.enrichOverlay(poorOverlay);
        const key = `position-${position}-${poorOverlay.id}`;
        if (overlay.context) {
            const Context = createContextProvider(overlay.context);
            return (<Context key={key}>
                {overlay.value}
            </Context>);
        } else {
            return overlay.value;
        }
    }

    public abstract getModelFittingBox(): Box;
}
