import * as THREE from 'three';
import { CSS3DRenderer } from './utils/CSS3DRenderer';
import { VrManager } from './vrUtils/vrManager';
import { Vector3d, Vector2d } from './models/structures';
import { Subscribable } from './utils';
export declare const DEFAULT_CAMERA_DIST = 100;
export declare const DEFAULT_SCREEN_PARAMETERS: {
    VIEW_ANGLE: number;
    NEAR: number;
    FAR: number;
};
export interface CameraState {
    position: Vector3d;
    focusDirection?: Vector3d;
}
export declare type AnimationLoopAction = () => boolean;
export interface CancellationEvents {
    'cancel': void;
}
export declare class Cancellation extends Subscribable<CancellationEvents> {
    isCancelled: boolean;
    stop(): void;
}
export declare class Core {
    private readonly animationLoopActions;
    private forceRenderCallback;
    renderer: THREE.WebGLRenderer;
    overlayRenderer: CSS3DRenderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
    rootHTML: HTMLElement | undefined;
    rootOverlayHtml: HTMLElement | undefined;
    vrManager: VrManager;
    screenParameters: {
        WIDTH: number;
        HEIGHT: number;
        VIEW_ANGLE: number;
        ASPECT: number;
        NEAR: number;
        FAR: number;
    };
    constructor();
    addAnimationLoopAction(action: AnimationLoopAction): void;
    removeAnimationLoopAction(action: AnimationLoopAction): void;
    animationFrameInterval(intervalCallback: () => boolean | void): Cancellation;
    attachTo(rootHTML: HTMLElement, rootOverlayHtml: HTMLElement): void;
    mouseTo3dPos(event: MouseEvent | TouchEvent, distanceFromScreen?: number): Vector3d;
    clientPosTo3dPos(position: Vector2d, distanceFromScreen?: number): Vector3d;
    pos3dToClientPos(position: Vector3d): Vector2d;
    readonly cameraState: CameraState;
    setCameraState(cameraState: CameraState): void;
    resize(): void;
    forceRender: (callback?: () => void) => void;
    private initScene;
    private forceRenderAction;
    private vrAction;
    private setAnimationLoop;
}
