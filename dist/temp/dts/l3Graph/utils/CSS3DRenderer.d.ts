import * as THREE from 'three';
/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author yomotsu / https://yomotsu.net/
 */
export declare class CSS3DObject extends THREE.Object3D {
    element: HTMLElement;
    constructor(element: HTMLElement);
}
export declare class CSS3DSprite extends CSS3DObject {
    element: HTMLElement;
    constructor(element: HTMLElement);
}
export declare class CSS3DRenderer {
    _width: number;
    _height: number;
    _widthHalf: number;
    _heightHalf: number;
    matrix: THREE.Matrix4;
    cache: {
        camera: {
            fov: number;
            style: string;
        };
        objects: WeakMap<object, any>;
    };
    domElement: HTMLDivElement;
    cameraElement: HTMLDivElement;
    isIE: boolean;
    constructor();
    getSize(): {
        width: number;
        height: number;
    };
    setSize(width: number, height: number): void;
    private getObjectCSSMatrix;
    private renderObject;
    private zOrder;
    render(scene: THREE.Scene, camera: THREE.Camera): void;
}
