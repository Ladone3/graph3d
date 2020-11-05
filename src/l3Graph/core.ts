import * as THREE from 'three';
import { CSS3DRenderer } from './utils/CSS3DRenderer';
import { VrManager } from './vrUtils/vrManager';
import { Vector3d, Vector2d } from './models/structures';
import { eventToPosition, vector3dToTreeVector3, Subscribable } from './utils';

export const DEFAULT_CAMERA_DIST = 100;
export const DEFAULT_SCREEN_PARAMETERS = {
    VIEW_ANGLE: 45,
    NEAR: 0.1,
    FAR: 10000,
};

export interface CameraState {
    position: Vector3d;
    focusDirection?: Vector3d;
}

/**
 * Contains action and tells whether render is needed
 */
export type AnimationLoopAction = () => boolean;

export interface CancellationEvents {
    'cancel': void;
}

export class Cancellation extends Subscribable<CancellationEvents> {
    public isCancelled: boolean = false;
    stop() {
        this.isCancelled = true;
        this.trigger('cancel');
    }
}

export class Core {
    private readonly animationLoopActions = new Set<AnimationLoopAction>();
    private forceRenderFlag = false;

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

    constructor() {
        this.vrManager = new VrManager(this);
        this.vrManager.on('connection:state:changed', () => {
            if (this.vrManager.isConnected) {
                this.animationLoopActions.add(this.vrAction);
            } else {
                this.animationLoopActions.delete(this.vrAction);
            }
        });
        this.animationLoopActions.add(this.forceRenderAction);
        this.initScene();
    }

    addAnimationLoopAction(action: AnimationLoopAction) {
        this.animationLoopActions.add(action);
    }

    removeAnimationLoopAction(action: AnimationLoopAction) {
        this.animationLoopActions.delete(action);
    }

    animationFrameInterval(
        intervalCallback: () => boolean | void,
    ): Cancellation {
        const cancellation = new Cancellation();

        const animate: AnimationLoopAction = () => {
            return cancellation.isCancelled ? false : intervalCallback() || false;
        };
        this.addAnimationLoopAction(animate);

        cancellation.on('cancel', () => {
            this.removeAnimationLoopAction(animate);
        });

        return cancellation;
    }

    attachTo(rootHTML: HTMLElement, rootOverlayHtml: HTMLElement) {
        this.rootHTML = rootHTML;
        this.rootHTML.appendChild(this.renderer.domElement);
        this.rootOverlayHtml = rootOverlayHtml;
        this.rootOverlayHtml.appendChild(this.overlayRenderer.domElement);
        this.resize();
    }

    mouseTo3dPos(event: MouseEvent | TouchEvent, distanceFromScreen: number = 600): Vector3d {
        const bBox = this.rootHTML ?
            this.rootHTML.getBoundingClientRect() : {x: 0, y: 0, width: 100, height: 100} as DOMRect;
        return this.clientPosTo3dPos(eventToPosition(event, bBox) || {x: 0, y: 0}, distanceFromScreen);
    }

    clientPosTo3dPos(position: Vector2d, distanceFromScreen: number = 600): Vector3d {
        const cameraPos = this.camera.position;
        const screenParameters = this.screenParameters;
        const vector = new THREE.Vector3(
            (position.x / screenParameters.WIDTH) * 2 - 1,
            1 - (position.y / screenParameters.HEIGHT) * 2,
            1
        );
        const point = vector.unproject(this.camera);
        const distance = point.distanceTo(cameraPos);
        const k = distanceFromScreen / distance;

        const relativePoint: Vector3d = {
            x: point.x - cameraPos.x,
            y: point.y - cameraPos.y,
            z: point.z - cameraPos.z,
        };
        return {
            x: relativePoint.x * k + cameraPos.x,
            y: relativePoint.y * k + cameraPos.y,
            z: relativePoint.z * k + cameraPos.z,
        };
    }

    pos3dToClientPos(position: Vector3d): Vector2d {
        const treePos = vector3dToTreeVector3(position);
        const screenParameters = this.screenParameters;
        const vector = treePos.project(this.camera);
        return {
            x: (vector.x + 1) * screenParameters.WIDTH / 2,
            y: (1 - vector.y) * screenParameters.HEIGHT / 2,
        };
    }

    get cameraState(): CameraState {
        const focusDirection = new THREE.Vector3(0, 0, - 1);
        focusDirection.applyQuaternion(this.camera.quaternion);
        return {
            position: this.camera.position,
            focusDirection,
        };
    }

    setCameraState(cameraState: CameraState) {
        const {position, focusDirection} = cameraState;
        this.camera.position.x = position.x;
        this.camera.position.y = position.y;
        this.camera.position.z = position.z;

        if (focusDirection) {
            this.camera.lookAt(new THREE.Vector3(
                focusDirection.x,
                focusDirection.y,
                focusDirection.z,
            ));
        }
        this.forceRender();
    }

    resize() {
        if (!this.rootHTML) { return; }
        this.screenParameters = {
            ...this.screenParameters,
            WIDTH: this.rootHTML.clientWidth,
            HEIGHT: this.rootHTML.clientHeight,
            ASPECT: this.rootHTML.clientWidth / this.rootHTML.clientHeight,
        };
        this.renderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.overlayRenderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.camera.aspect = this.screenParameters.ASPECT;
        this.camera.updateProjectionMatrix();
        this.forceRender();
    }

    forceRender = () => {
        this.forceRenderFlag = true;
    }

    private initScene() {
        // Create main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(255, 255, 255);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.0003);

        // Prepare perspective camera
        this.screenParameters = {
            ...DEFAULT_SCREEN_PARAMETERS,
            WIDTH: 100,
            HEIGHT: 100,
            ASPECT: 1,
        };

        this.camera = new THREE.PerspectiveCamera(
            this.screenParameters.VIEW_ANGLE,
            this.screenParameters.ASPECT,
            this.screenParameters.NEAR,
            this.screenParameters.FAR,
        );
        this.camera.position.set(0, 0, DEFAULT_CAMERA_DIST);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);

        // Add lights
        const dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(200, 200, 1000).normalize();
        this.scene.add(new THREE.AmbientLight(0x444444));
        this.camera.add(dirLight);
        this.camera.add(dirLight.target);

        // Prepare webgl renderer
        this.renderer = new THREE.WebGLRenderer({antialias: true}) as any;
        this.renderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );
        this.renderer.setClearColor('white');

        // xr
        // document.body.appendChild(VRButton.createButton(this.renderer));
        this.renderer.xr.enabled = true;

        // Prepare sprite renderer (css3d)
        this.overlayRenderer = new CSS3DRenderer();
        this.overlayRenderer.setSize(
            this.screenParameters.WIDTH,
            this.screenParameters.HEIGHT,
        );

        // Helper sphere
        const sphereGeometry = new THREE.SphereGeometry(this.screenParameters.FAR / 2, 35, 35);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            wireframe: true, color: 0xf0f0f0,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(0, 0, 0);
        this.scene.add(sphere);

        // Finalize
        this.renderer.render(this.scene, this.camera);
        this.overlayRenderer.render(this.scene, this.camera);
        this.setAnimationLoop();
    }

    private forceRenderAction = () => {
        if (this.forceRenderFlag) {
            this.forceRenderFlag = false;
            return true;
        } else {
            return false;
        }
    }

    private vrAction = () => true;

    private setAnimationLoop() {
        this.renderer.setAnimationLoop(() => {
            let renderNeeded = false;
            this.animationLoopActions.forEach(action => {
                const askForRender = action();
                renderNeeded = renderNeeded || askForRender;
            });
            if (renderNeeded) {
                this.renderer.render(this.scene, this.camera);
                this.overlayRenderer.render(this.scene, this.camera);
            }
        });
    }
}
