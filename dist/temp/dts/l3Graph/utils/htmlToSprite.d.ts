import * as THREE from 'three';
import { OverlayPosition } from '../views/graph/overlayAnchor';
import { Vector2d } from '../models/structures';
export interface Rendered3dSprite {
    sprite: THREE.Sprite;
    position: OverlayPosition;
    size: Vector2d;
}
export declare function createSprite(htmlOverlay: HTMLElement, position: OverlayPosition): Promise<Rendered3dSprite>;
