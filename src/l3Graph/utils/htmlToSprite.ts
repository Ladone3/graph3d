import * as THREE from 'three';
import { OverlayPosition } from '../views/graph/overlayAnchor';
import { Vector2D } from '../models/structures';

const domtoimage = require<any>('dom-to-image');

export interface Rendered3dSprite {
    sprite: THREE.Sprite;
    position: OverlayPosition;
    size: Vector2D;
}

export function createSprite(
    htmlOverlay: HTMLElement,
    position: OverlayPosition,
): Promise<Rendered3dSprite> {
    const texture = new THREE.Texture();
    const materialParams = {map: texture, color: 0xffffff};
    const spriteMaterial = new THREE.SpriteMaterial(materialParams);
    const sprite = new THREE.Sprite(spriteMaterial);
    (sprite as any).center = CENTER_VECTOR_FOR_POSITION[position];

    texture.image = htmlToImage(htmlOverlay);
    texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;

    return new Promise(resolve => {
        texture.image.onload = () => {
            texture.needsUpdate = true;
            sprite.scale.set(texture.image.width, texture.image.height, 1);
            resolve({
                position,
                sprite,
                size: {x: texture.image.width, y: texture.image.height}
            });
        };
    })
}


// In future here can be a service request
function htmlToImage(htmlElement: HTMLElement): HTMLImageElement {
    const img = new Image();
    domtoimage.toPng(htmlElement).then(function (dataUrl: string) {
        img.src = dataUrl;
    }).catch(function (error: string) {
        console.error('oops, something went wrong!', error);
        img.src = ERROR_BASE_64;
    });
    return img;
}

const CENTER_VECTOR_FOR_POSITION = {
    'e': new THREE.Vector2(0, 0.5),
    'w': new THREE.Vector2(1, 0.5),
    'n': new THREE.Vector2(0.5, 1),
    's': new THREE.Vector2(0.5, 0),
    'c': new THREE.Vector2(0.5, 0.5),
    'ne': new THREE.Vector2(0, 1),
    'se': new THREE.Vector2(0, 0),
    'nw': new THREE.Vector2(1, 1),
    'sw': new THREE.Vector2(1, 0),
}

const ERROR_BASE_64 = 'data:image/png;base64,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';