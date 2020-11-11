import * as ReactDOM from 'react-dom';
import * as React from 'react';
import * as THREE from 'three';
import { ReactOverlay, createContextProvider, enrichOverlay } from '../../customization';
import { Box, Vector3d } from '../../models/structures';
import { Subscribable, sum } from '../../utils';
import { CSS3DSprite } from '../../utils/CSS3DRenderer';
import { Rendered3dSprite, createSprite } from '../../utils/htmlToSprite';

export type OverlayPosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'c';

export interface OverlayAnchorEvents {
    'anchor:changed': void;
}

// todo: verify again the functions list - not everything is clear here
export abstract class AbstractOverlayAnchor<Model = unknown, View = unknown> extends Subscribable<OverlayAnchorEvents> {
    readonly html: HTMLElement;
    readonly _renderedOverlays = new Map<string, HTMLElement>();
    readonly _overlayPositions: Map<string, OverlayPosition>;
    readonly sprite: CSS3DSprite;
    protected overlaysByPosition: Map<
        OverlayPosition,
        Map<string, ReactOverlay<Model>>
    >;

    constructor(
        protected meshModel: Model,
        protected meshView: View,
    ) {
        super();
        this.html = document.createElement('DIV');
        this.sprite = new CSS3DSprite(this.html);
        this.overlaysByPosition = new Map();
        this._overlayPositions = new Map();
        this.redraw();
    }

    get overlays(): ReadonlyMap<OverlayPosition, ReadonlyMap<string, ReactOverlay<Model>>> {
        return this.overlaysByPosition;
    }

    hasOverlay(overlayId: string): boolean {
        return this._overlayPositions.has(overlayId);
    }

    isVisible() {
        return this.overlaysByPosition.size > 0;
    }

    hide() {
        this._overlayPositions.forEach((p, id) => {
            this.removeOverlay(id);
        });
    }

    setOverlay(overlay: ReactOverlay<Model>, position: OverlayPosition) {
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

    protected enrichOverlay(poorOverlay: ReactOverlay<Model>): ReactOverlay<Model> {
        return enrichOverlay(poorOverlay, this.meshModel);
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
            let groupIndex = 0;
            this.overlaysByPosition.forEach((overlays, position) => {
                const overlayViews: JSX.Element[] = [];
                overlays.forEach((poorOverlay, index) => {
                    overlayViews.push(<div
                        key={`overlay-${index}`}
                        ref={(ref => this._renderedOverlays.set(poorOverlay.id, ref))}>
                        {this.renderOverlay(poorOverlay, position)}
                    </div>);
                });
                overlayGroups.push(<OverlayedGroup
                    key={`overlay-group-${position}-${groupIndex++}`}
                    position={position}>{overlayViews}
                </OverlayedGroup>);
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

    private renderOverlay(poorOverlay: ReactOverlay<Model>, position: OverlayPosition) {
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
    public abstract createAnchor3d(): AbstractOverlayAnchor3d<Model, View>;
}

export abstract class AbstractOverlayAnchor3d<Model = unknown, View = unknown> {
    readonly mesh: THREE.Object3D;
    sprites: Rendered3dSprite[];

    constructor(
        protected meshModel: Model,
        protected meshView: View,
        protected overlayAnchor: AbstractOverlayAnchor<Model, View>,
    ) {
        const spriteGroup = new THREE.Sprite();
        const superAfterRender = spriteGroup.onAfterRender;
        spriteGroup.onAfterRender = (
            renderer: THREE.WebGLRenderer,
            scene: THREE.Scene,
            camera: THREE.Camera,
            geometry: THREE.Geometry | THREE.BufferGeometry,
            material: THREE.Material,
            group: THREE.Group,
        ) => {
            spriteGroup.lookAt(camera.position);
            superAfterRender(renderer, scene, camera, geometry, material, group);
        };
        this.mesh = spriteGroup;
        this.renderSprites();

        overlayAnchor.on('anchor:changed', () => this.renderSprites());
    }

    update() {
        this.updatePosition();
    }

    private renderSprites() {
        const spritePromises: Promise<Rendered3dSprite>[] = [];
        this.overlayAnchor._renderedOverlays.forEach((html, id) => {
            const position = this.overlayAnchor._overlayPositions.get(id);
            if (html && position) {
                spritePromises.push(createSprite(html, position));
            }
        });

        Promise.all(spritePromises).then(renderedSprites => {
            if (this.sprites) {
                for (const renderedSprite of this.sprites) {
                    this.mesh.remove(renderedSprite.sprite);
                }
            }
            this.placeSprites(renderedSprites);
            for (const renderedSprite of renderedSprites) {
                this.mesh.add(renderedSprite.sprite);
            }
            this.sprites = renderedSprites;
            this.forceUpdate();
        });
    }

    abstract forceUpdate(): void;
    abstract updatePosition(): void;
    abstract placeSprites(sprites: Rendered3dSprite[]): void;
}

export function applyOffset(
    basicVector: Vector3d,
    offset: Vector3d,
    position: OverlayPosition,
): Vector3d {
    const {x: xOffset, y: yOffset} = offset;
    let offsetByPossition: Vector3d;
    switch (position) {
        case 'e': offsetByPossition = {x: xOffset,  y: 0, z: 0}; break;
        case 'w': offsetByPossition = {x: -xOffset, y: 0, z: 0}; break;
        case 'n': offsetByPossition = {x: 0, y: -yOffset, z: 0}; break;
        case 's': offsetByPossition = {x: 0, y: yOffset, z: 0}; break;
        case 'ne': offsetByPossition = {x: xOffset,  y: -yOffset, z: 0}; break;
        case 'se': offsetByPossition = {x: xOffset,  y: yOffset, z: 0}; break;
        case 'nw': offsetByPossition = {x: -xOffset,  y: -yOffset, z: 0}; break;
        case 'sw': offsetByPossition = {x: -xOffset,  y: yOffset, z: 0}; break;
        default: offsetByPossition = {x: 0, y: 0, z: 0};
    }
    return sum(basicVector, offsetByPossition);
}
