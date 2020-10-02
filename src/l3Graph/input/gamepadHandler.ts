import * as THREE from 'three';
import { Subscribable } from '../utils/subscribable';
import {
    Cancellation, animationFrameInterval,
    threeVector3ToVector3d, getModelFittingBox
} from '../utils';
import { Element } from '../models/graph/graphModel';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView, DEFAULT_SCREEN_PARAMETERS } from '../views/diagramView';
import { mapMeshes } from './mouseHandler';
import { Node } from '../models/graph/node';
import { Vector3d } from '../models/structures';
import { DragHandlerEvents } from './dragHandler';

export type Controller = THREE.Group;

export interface GamepadHandlerEvents extends DragHandlerEvents {
    'keyDown': {
        controller: Controller;
        button: GAMEPAD_BUTTON;
    };
    'keyUp': {
        controller: Controller;
        button: GAMEPAD_BUTTON;
    };
}

export const GAMEPAD_EXTRA_MOVE_STEP = 10;

export enum GAMEPAD_BUTTON {
    TRIGGER = 'TRIGGER',
    GRUBBER = 'GRUBBER',
}

export const OCULUS_CONTROLLERS = {
    LEFT_CONTROLLER: 1,
    RIGHT_CONTROLLER: 0,
};

export const CONTROLLERS_NUMBER = Object.keys(OCULUS_CONTROLLERS).length;

interface ControllerSubscription {
    isDragging?: boolean;
    targetParent?: THREE.Object3D;
    mockObject?: THREE.Object3D;
    position?: Vector3d;
    target?: Node;
    onDragStart: () => void;
    onDrag: () => void;
    onDragEnd: () => void;
}

// It's currently support only OCULUS gamepads
export class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    private _keyPressedMap = new Map<Controller, Set<GAMEPAD_BUTTON>>();
    private targets = new Map<Controller, Element | undefined>();
    private subscriptions = new Map<Controller, ControllerSubscription>();

    private cancellation: Cancellation | undefined;
    private rayCaster: THREE.Raycaster;
    private tempMatrix: THREE.Matrix4;

    constructor(
        private diagramModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        super();
        this.rayCaster = new THREE.Raycaster();
        this.tempMatrix = new THREE.Matrix4();
        this.diagramView.vrManager.on('connection:state:changed', () => {
            if (this.diagramView.vrManager.isConnected) {
                this.cancellation = this.start();
                this.subscribeOnControllers();
            } else {
                if (this.cancellation) {
                    this.cancellation.stop();
                    this.cancellation = undefined;
                    this.unsubscribeFromController();
                }
            }
        });
    }

    getController(controllerId: number) {
        return this.diagramView.vrManager.getController(controllerId);
    }

    get keyPressedMap(): ReadonlyMap<Controller, ReadonlySet<GAMEPAD_BUTTON>> {
        return this._keyPressedMap;
    }

    private subscribeOnControllers() {
        for (let controllerId = 0; controllerId < CONTROLLERS_NUMBER; controllerId++) {
            const controller = this.diagramView.vrManager.getController(controllerId);
            if (!controller) { continue; }
            this._keyPressedMap.set(controller, new Set());
            const subscription: ControllerSubscription = {
                onDragStart: () => {
                    this._keyPressedMap.get(controller).add(GAMEPAD_BUTTON.TRIGGER);
                    this.trigger('keyDown', {
                        controller, button: GAMEPAD_BUTTON.TRIGGER,
                    });
                    if (!subscription.isDragging) {
                        this.onDragStartEvent(controller);
                    }
                },
                onDrag: () => this.onDragEvent(controller),
                onDragEnd: () => {
                    this._keyPressedMap.get(controller).delete(GAMEPAD_BUTTON.TRIGGER);
                    this.trigger('keyUp', {
                        controller, button: GAMEPAD_BUTTON.TRIGGER,
                    });
                    if (subscription.isDragging) {
                        this.onDragEndEvent(controller);
                    }
                },
            };
            this.subscriptions.set(controller, subscription);
            controller.addEventListener('selectstart', subscription.onDragStart);
            // controller.addEventListener('select', subscription.onDrag);
            controller.addEventListener('selectend', subscription.onDragEnd);
            controller.addEventListener('squeezestart', subscription.onDragStart);
            // controller.addEventListener('squeeze', subscription.onDrag);
            controller.addEventListener('squeezeend', subscription.onDragEnd);
        }
    }

    private unsubscribeFromController() {
        for (let controllerId = 0; controllerId < CONTROLLERS_NUMBER; controllerId++) {
            const controller = this.diagramView.vrManager.getController(controllerId);
            if (!controller) { continue; }
            const subscription = this.subscriptions.get(controller);
            controller.removeEventListener('selectstart', subscription.onDragStart);
            // controller.removeEventListener('select', subscription.onDrag);
            controller.removeEventListener('selectend', subscription.onDragEnd);
            controller.removeEventListener('squeezestart', subscription.onDragStart);
            // controller.removeEventListener('squeeze', subscription.onDrag);
            controller.removeEventListener('squeezeend', subscription.onDragEnd);
            this.subscriptions.delete(controller);
        }
    }

    private onDragStartEvent(controller: Controller) {
        const target = this.targets.get(controller);
        const subscription = this.subscriptions.get(controller);
        if (target) {
            startDragging(
                target,
                this.diagramView,
                controller,
                subscription,
            );

            this.trigger('elementDragStart', {
                target,
                position: subscription.position,
            });
        }
    }

    private onDragEvent(controller: Controller) {
        const subscription = this.subscriptions.get(controller);

        dragElement(
            this.diagramView,
            0,
            controller,
            subscription,
        );

        this.trigger('elementDrag', {
            target: subscription.target,
            position: subscription.position,
        });
    }

    private onDragEndEvent(controller: Controller) {
        const subscription = this.subscriptions.get(controller);

        const target = subscription.target;
        stopDragging(subscription, this.diagramView, controller);

        this.trigger('elementDragEnd', {
            target,
            position: subscription.position,
        });
    }

    private handlerTimeLoop() {
        for (let controllerId = 0; controllerId < CONTROLLERS_NUMBER; controllerId++) {
            const controller = this.diagramView.vrManager.getController(controllerId);
            if (!controller) { continue; }
            const prevTarget = this.targets.get(controller);
            const target = this.getTarget(controller);
            if (prevTarget) {
                if (target) {
                    this.trigger('elementHover', {
                        target: target,
                        position: target instanceof Node ? target.position : undefined,
                    });
                } else {
                    this.targets.delete(controller);
                    this.trigger('elementHoverEnd', {
                        target: prevTarget,
                        position: prevTarget instanceof Node ? prevTarget.position : undefined,
                    });
                }
            } else {
                if (target) {
                    this.targets.set(controller, target);
                    this.trigger('elementHoverStart', {
                        target: target,
                        position: target instanceof Node ? target.position : undefined,
                    });
                }
            }
            const subscription = this.subscriptions.get(controller);
            if (subscription && subscription.isDragging) {
                subscription.onDrag();
            }
        }
    }

    private getTarget(controller: Controller): Element | undefined {
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);
        this.rayCaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        this.rayCaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
        const {meshes, nodeMeshMap} = mapMeshes(this.diagramModel, this.diagramView);

        const intersections = this.rayCaster.intersectObjects(meshes);

        if (intersections.length > 0) {
            const intersectedMesh = intersections[0].object;
            const index = meshes.indexOf(intersectedMesh);
            return nodeMeshMap[index];
        } else {
            return undefined;
        }
    }

    private start(): Cancellation {
        if (this.cancellation) { return this.cancellation; }
        return animationFrameInterval(() => {
            this.handlerTimeLoop();
        });
    }
}

function startDragging(
    target: Element,
    diagramView: DiagramView,
    controller: Controller,
    subscription: ControllerSubscription,
) {
    if (target && target instanceof Node) {
        const elementMesh = diagramView.graphView.nodeViews.get(target).mesh;
        if (controller) {
            const mockObject = elementMesh.clone();
            mockObject.visible = false;
            attach(mockObject, controller, diagramView.scene);
            subscription.isDragging = true;
            subscription.mockObject = mockObject;
            subscription.targetParent = diagramView.scene;
            subscription.target = target;
            subscription.position = target.position;
        }
    }
}

function dragElement(
    diagramView: DiagramView,
    zOffset: number,
    controller: Controller,
    subscription: ControllerSubscription,
) {
    if (subscription) {
        if (controller) {
            attach(subscription.mockObject, diagramView.scene, diagramView.scene);
            subscription.position = threeVector3ToVector3d(subscription.mockObject.position);
            attach(subscription.mockObject, controller, diagramView.scene);
            if (zOffset !== 0) {
                const dist = subscription.mockObject.position.z + zOffset;
                const fittingBox = getModelFittingBox(subscription.target.size);
                const limitedValue =  Math.max(
                    Math.min(
                        Math.abs(dist),
                        DEFAULT_SCREEN_PARAMETERS.FAR,
                    ),
                    DEFAULT_SCREEN_PARAMETERS.NEAR + fittingBox.deep / 2)
                ;
                subscription.mockObject.position.setZ(dist > 0 ? limitedValue : -limitedValue);
            }
        }
    }
}

function stopDragging(
    subscription: ControllerSubscription,
    diagramView: DiagramView,
    controller: Controller,
) {
    if (subscription) {
        if (controller) {
            attach(subscription.mockObject, subscription.targetParent, diagramView.scene);
            subscription.position = threeVector3ToVector3d(subscription.mockObject.position);
            detach(subscription.mockObject, subscription.mockObject.parent, diagramView.scene);
            subscription.target = undefined;
            subscription.mockObject = undefined;
            subscription.targetParent = undefined;
            subscription.isDragging = false;
        }
    }
}

export function attach(child: THREE.Object3D, to: THREE.Object3D, scene: THREE.Scene) {
    if (!(child && scene && to)) { throw new Error('Inconsistent state!'); }
    if (child.parent) { detach(child, child.parent, scene); }
    _attach(child, scene, to);
}

export function detach(child: THREE.Object3D, parent: THREE.Object3D, scene: THREE.Scene) {
    child.applyMatrix4(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
}

export function _attach(child: THREE.Object3D, scene: THREE.Scene, parent: THREE.Object3D) {
    child.applyMatrix4(new THREE.Matrix4().getInverse(parent.matrixWorld));
    scene.remove(child);
    parent.add(child);
}
