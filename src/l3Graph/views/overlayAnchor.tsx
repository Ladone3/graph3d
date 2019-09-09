import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Size } from '../models/node';
import { ReactOverlay, createContextProvider, enrichOverlay } from '../customisation';
import { Vector3D, Box } from '../models/primitives';

export type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';

export interface PositionedReactOverlay {
    overlay: ReactOverlay;
    position: OverlayPosition;
}

export interface OverlayAnchor {
    html: HTMLElement;
    isVisible(): boolean;
    getSprite(): THREE.CSS3DSprite | undefined;
    hasOverlay(positionedOverlay: PositionedReactOverlay): boolean;
    attachOverlay(customeOverlay: PositionedReactOverlay): void;
    removeOverlay(customeOverlay: PositionedReactOverlay): void;
    update(position?: Vector3D, size?: Size): void; // Optimization
}

export class MockOverlayAnchor implements OverlayAnchor {
    public html = document.createElement('div');
    isVisible() {
        return false;
    }

    hasOverlay(positionedOverlay: PositionedReactOverlay): boolean {
        return false;
    }

    getSprite(): undefined {
        return undefined;
    }

    attachOverlay() {
        throw new Error('Method is not allowed for this element!');
    }

    removeOverlay() {
        throw new Error('Method is not allowed for this element!');
    }

    update() {
        // do nothing<
    }
}

export abstract class AbstractOverlayAnchor<Model, View> implements OverlayAnchor {
    public html: HTMLElement;
    protected sprite: THREE.CSS3DSprite;
    protected overlaysByPosition: Map<OverlayPosition, ReactOverlay[]>;

    constructor(
        protected meshModel: Model,
        protected meshView: View,
    ) {
        this.html = document.createElement('DIV');
        this.sprite = new THREE.CSS3DSprite(this.html);
        this.overlaysByPosition = new Map();
    }

    getSprite() {
        if (!this.isVisible()) {
            return undefined;
        }
        return this.sprite;
    }

    hasOverlay(positionedOverlay: PositionedReactOverlay): boolean {
        const spriteSet = this.overlaysByPosition.get(positionedOverlay.position);
        return spriteSet && spriteSet.indexOf(positionedOverlay.overlay) !== -1;
    }

    isVisible() {
        return this.overlaysByPosition.size > 0;
    }

    attachOverlay(positionedOverlay: PositionedReactOverlay) {
        const {position: pos, overlay} = positionedOverlay;
        if (!this.overlaysByPosition.has(pos)) {
            this.overlaysByPosition.set(pos, []);
        }
        this.overlaysByPosition.get(pos).push(overlay);
        this.update();
    }

    removeOverlay(positionedOverlay: PositionedReactOverlay) {
        const {position: pos, overlay} = positionedOverlay;
        if (this.overlaysByPosition.has(pos)) {
            const newListForPosition =
                this.overlaysByPosition.get(pos).filter(o => o !== overlay);
            if (newListForPosition.length === 0) {
                this.overlaysByPosition.set(pos, newListForPosition);
            } else {
                this.overlaysByPosition.delete(pos);
            }
        }
        this.update();
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

    update(prefferedPosition?: Vector3D) {
        const OverlayedGroup = this.overlayedGroup;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.html);
        } else {
            let index = 0;
            const overlayGroups: JSX.Element[] = [];
            this.overlaysByPosition.forEach((overlays, position) => {
                const overlayViews: JSX.Element[] = [];
                for (const o of overlays) {
                    const overlay = this.enrichOverlay(o);
                    const key = `position-${position}-${index}`;
                    if (overlay.context) {
                        const Context = createContextProvider(overlay.context);
                        overlayViews.push(<Context key={key}>
                            {overlay.value}
                        </Context>);
                    } else {
                        overlayViews.push(overlay.value);
                    }
                    index++;
                }
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

    protected abstract getModelFittingBox(): Box;
}
