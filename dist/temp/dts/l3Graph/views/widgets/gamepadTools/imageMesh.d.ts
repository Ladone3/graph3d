import * as THREE from 'three';
import { Vector2d } from '../../../models/structures';
export interface ImageMeshParameters {
    size?: Partial<Vector2d>;
    image?: HTMLImageElement;
}
export declare class ImageMesh extends THREE.Group {
    private image;
    private size;
    private plane;
    private borderPlane;
    constructor(parameters?: ImageMeshParameters);
    setImage(image: HTMLImageElement | undefined): void;
    setPreferredSize(size: Vector2d | undefined): void;
    private render;
}
