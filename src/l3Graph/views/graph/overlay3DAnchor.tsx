import * as THREE from 'three';
import { createSprite, Rendered3dSprite } from '../../utils/htmlToSprite';
import { AbstractOverlayAnchor, OverlayPosition } from './overlayAnchor';
import { Vector3d } from '../../models/structures';
import { sum } from '../../utils';

export abstract class AbstracrOverlayAnchor3d<Model, View> {
    readonly mesh: THREE.Group;
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
        }
        this.mesh = spriteGroup;
        this.renderSprites();
        
        overlayAnchor.on('anchor:changed', () => this.renderSprites());
    }

    update() {
        this.updatePosition();
    }

    private renderSprites() {
        const spritePromises: Promise<Rendered3dSprite>[] = [];
        this.overlayAnchor.renderedOverlays.forEach((html, id) => {
            const position = this.overlayAnchor.overlayPositions.get(id);
            spritePromises.push(createSprite(html, position));
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
    switch(position) {
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