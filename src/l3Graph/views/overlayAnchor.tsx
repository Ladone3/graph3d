import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Node, Size } from '../models/node';
import { ReactOverlay, createContextProvider } from '../customisation';
import { Element } from '../models/graphModel';
import { Link } from '../models/link';
import { sum, multiply } from '../utils';
import { Vector3D } from '../models/primitives';

export type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';

export interface PositionedReactOverlay {
    overlay: ReactOverlay;
    position: OverlayPosition;
}

export interface OverlayAnchor {
    isVisible(): boolean;
    getSprite(): THREE.CSS3DSprite | undefined;
    hasOverlay(positionedOverlay: PositionedReactOverlay): boolean;
    attachOverlay(customeOverlay: PositionedReactOverlay): void;
    removeOverlay(customeOverlay: PositionedReactOverlay): void;
    update(position?: Vector3D, size?: Size): void; // Optimization
}

export class MockOverlayAnchor implements OverlayAnchor {
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
        // do nothing
    }
}

export class NodeOverlayAnchor implements OverlayAnchor {
    private sprite: THREE.CSS3DSprite;
    private htmlOverlay: HTMLElement;
    private overlaysByPosition: Map<OverlayPosition, ReactOverlay[]>;

    constructor(public meshModel: Node) {
        this.htmlOverlay = document.createElement('DIV');
        this.sprite = new THREE.CSS3DSprite(this.htmlOverlay);
        this.overlaysByPosition = new Map();
    }

    getSprite() {
        if (!this.isVisible()) {
            return undefined;
        }
        return this.sprite;
    }

    hasOverlay(positionedOverlay: PositionedReactOverlay): boolean {
        return this.overlaysByPosition.
            get(positionedOverlay.position).
            indexOf(positionedOverlay.overlay) !== -1;
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

    update() {
        const model = this.meshModel;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.htmlOverlay);
        } else {
            let index = 0;
            const overlayGroups: JSX.Element[] = [];
            this.overlaysByPosition.forEach((overlays, position) => {
                const overlayViews: JSX.Element[] = [];
                for (const overlay of overlays) {
                    const OverlayView = overlay.get();
                    const key = `position-${position}-${index}`;
                    if (overlay.context) {
                        const Context = createContextProvider(overlay.context);
                        overlayViews.push(<Context key={key}>
                            <OverlayView link={...model.data}></OverlayView>
                        </Context>);
                    } else {
                        overlayViews.push(
                            <OverlayView key={key} {...model.data}></OverlayView>
                        );
                    }
                    index++;
                }
                overlayGroups.push(
                    <div
                        key={`overlay-group-${position}`}
                        className={`l3g-html-overlay l3g-position-${position}`}>
                            <div className='l3g-html-overlay-aligner'>
                                <div className='l3g-html-overlay__body'>
                                    {overlayViews}
                                </div>
                            </div>
                    </div>,
                );
            });
            const maxSide = Math.max(
                model.size.x,
                model.size.y,
                model.size.z,
            );
            ReactDOM.render(
                <div
                    className='l3g-node-overlay-anchor'
                    style={{width: maxSide, height: maxSide}}>
                    {overlayGroups}
                </div>,
                this.htmlOverlay,
            );

            const {x, y, z} = this.meshModel.position;
            this.sprite.position.set(x, y, z);
        }
    }
}

export class LinkOverlayAnchor implements OverlayAnchor {
    private sprite: THREE.CSS3DSprite;
    private htmlOverlay: HTMLElement;
    private overlaysByPosition: Map<OverlayPosition, ReactOverlay[]>;

    constructor(public meshModel: Link) {
        this.htmlOverlay = document.createElement('DIV');
        this.sprite = new THREE.CSS3DSprite(this.htmlOverlay);
        this.overlaysByPosition = new Map();
    }

    getSprite() {
        if (!this.isVisible()) {
            return undefined;
        }
        return this.sprite;
    }

    hasOverlay(positionedOverlay: PositionedReactOverlay): boolean {
        return this.overlaysByPosition.
            get(positionedOverlay.position).
            indexOf(positionedOverlay.overlay) !== -1;
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

    update(position?: Vector3D) {
        const model = this.meshModel;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.htmlOverlay);
        } else {
            let index = 0;
            const overlayGroups: JSX.Element[] = [];
            this.overlaysByPosition.forEach((overlays, pos) => {
                const overlayViews: JSX.Element[] = [];
                for (const overlay of overlays) {
                    const OverlayView = overlay.get();
                    const key = `position-${pos}-${index}`;
                    if (overlay.context) {
                        const Context = createContextProvider(overlay.context);
                        overlayViews.push(<Context key={key}>
                            <OverlayView label={model.label}></OverlayView>
                        </Context>);
                    } else {
                        overlayViews.push(
                            <OverlayView key={key} label={model.label}></OverlayView>
                        );
                    }
                    index++;
                }
                overlayGroups.push(
                    <div
                        key={`overlay-group-${position}`}
                        className={`l3g-link-html-overlay l3g-position-${position}`}>
                        <div className='l3g-link-html-overlay__body'>
                            {overlayViews}
                        </div>
                    </div>
                );
            });
            ReactDOM.render(<div>{overlayGroups}</div>, this.htmlOverlay);

            const {x, y, z} = position || multiply(sum(
                this.meshModel.source.position,
                this.meshModel.target.position,
            ), 0.5);
            this.sprite.position.set(x, y, z);
        }
    }
}
