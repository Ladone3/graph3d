import * as THREE from 'three';
import { Rendered3dSprite } from '../../utils/htmlToSprite';
import { AbstractOverlayAnchor, OverlayPosition } from './overlayAnchor';
import { Vector3d } from '../../models/structures';
export declare abstract class AbstractOverlayAnchor3d<Model, View> {
    protected meshModel: Model;
    protected meshView: View;
    protected overlayAnchor: AbstractOverlayAnchor<Model, View>;
    readonly mesh: THREE.Object3D;
    sprites: Rendered3dSprite[];
    constructor(meshModel: Model, meshView: View, overlayAnchor: AbstractOverlayAnchor<Model, View>);
    update(): void;
    private renderSprites;
    abstract forceUpdate(): void;
    abstract updatePosition(): void;
    abstract placeSprites(sprites: Rendered3dSprite[]): void;
}
export declare function applyOffset(basicVector: Vector3d, offset: Vector3d, position: OverlayPosition): Vector3d;
