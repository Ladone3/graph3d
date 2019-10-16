import * as THREE from 'three';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Size } from '../../models/graph/node';
import { ReactOverlay, createContextProvider, enrichOverlay } from '../../customisation';
import { Vector3D, Box } from '../../models/structures';

export type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';

export interface OverlayAnchor {
    html: HTMLElement;
    isVisible(): boolean;
    getSprite(): THREE.CSS3DSprite | undefined;
    hasOverlay(owelrayId: string): boolean;
    setOverlay(overlay: ReactOverlay, position: OverlayPosition): void;
    removeOverlay(owelrayId: string): void;
    update(): void;
    render(): void;
}

export class MockOverlayAnchor implements OverlayAnchor {
    public html = document.createElement('div');
    isVisible() {
        return false;
    }

    hasOverlay(owelrayId: string): boolean {
        return false;
    }

    getSprite(): undefined {
        return undefined;
    }

    setOverlay() {
        throw new Error('Method is not allowed for this element!');
    }

    removeOverlay() {
        throw new Error('Method is not allowed for this element!');
    }

    update() {
        // do nothing
    }

    render() {
        // do nothing
    }
}

export abstract class AbstractOverlayAnchor<Model, View> implements OverlayAnchor {
    public html: HTMLElement;
    protected sprite: THREE.CSS3DSprite;
    protected overlaysByPosition: Map<OverlayPosition, Map<string, ReactOverlay>>;
    protected overlayPositions: Map<string, OverlayPosition>;

    constructor(
        protected meshModel: Model,
        protected meshView: View,
    ) {
        this.html = document.createElement('DIV');
        this.sprite = new THREE.CSS3DSprite(this.html);
        this.overlaysByPosition = new Map();
        this.overlayPositions = new Map();
    }

    getSprite() {
        if (!this.isVisible()) {
            return undefined;
        }
        return this.sprite;
    }

    hasOverlay(owelrayId: string): boolean {
        return this.overlayPositions.has(owelrayId);
    }

    isVisible() {
        return this.overlaysByPosition.size > 0;
    }

    setOverlay(overlay: ReactOverlay, position: OverlayPosition) {
        if (!this.overlaysByPosition.has(position)) {
            this.overlaysByPosition.set(position, new Map());
        }
        this.overlaysByPosition.get(position).set(overlay.id, overlay);
        this.overlayPositions.set(overlay.id, position);
        this.render();
        
    }

    removeOverlay(id: string) {
        if (!this.hasOverlay(id)) { return; }
        const position = this.overlayPositions.get(id);
        const overlaysOnPosition = this.overlaysByPosition.get(position);
        overlaysOnPosition.delete(id);
        if (overlaysOnPosition.size === 0) {
            this.overlaysByPosition.delete(position);
        }
        this.overlayPositions.delete(id);
        this.render();
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

    update() {
        if (this.overlaysByPosition.size > 0) {
            const {x, y, z} = this.getModelFittingBox();
            this.sprite.position.set(x, y, z);
        }
    }

    render() {
        const OverlayedGroup = this.overlayedGroup;
        if (this.overlaysByPosition.size === 0) {
            ReactDOM.unmountComponentAtNode(this.html);
        } else {
            const overlayGroups: JSX.Element[] = [];
            this.overlaysByPosition.forEach((overlays, position) => {
                const overlayViews: JSX.Element[] = [];
                overlays.forEach(poorOverlay => {
                    const overlay = this.enrichOverlay(poorOverlay);
                    const key = `position-${position}-${poorOverlay.id}`;
                    if (overlay.context) {
                        const Context = createContextProvider(overlay.context);
                        overlayViews.push(<Context key={key}>
                            {overlay.value}
                        </Context>);
                    } else {
                        overlayViews.push(overlay.value);
                    }
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

    protected abstract getModelFittingBox(): Box;
}
