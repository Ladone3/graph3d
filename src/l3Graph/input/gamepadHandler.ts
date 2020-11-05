import * as THREE from 'three';
import { Subscribable } from '../utils/subscribable';
import {
    threeVector3ToVector3d, multiply, distance, sub, sum, vector3dToTreeVector3, normalize
} from '../utils';
import { Element } from '../models/graph/graphModel';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { mapMeshes } from './mouseHandler';
import { Node } from '../models/graph/node';
import { Vector3d } from '../models/structures';
import { DragHandlerEvents } from './dragHandler';
import { Core, Cancellation } from '../core';

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
    controller: Controller;
    unsubscribe: () => void;
    target?: Node;
    targetParent?: THREE.Object3D;
    isDragging?: boolean;
    mockObject?: THREE.Object3D;
    position?: Vector3d;
    dragCompanion?: ControllerSubscription;
    dragCompanionFor?: ControllerSubscription;
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
        this.diagramView.core.vrManager.on('connection:state:changed', () => {
            if (this.diagramView.core.vrManager.isConnected) {
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
        // this.diagramView.core.scene.add(s1);
        // this.diagramView.core.scene.add(s2);
    }

    getController(controllerId: number) {
        return this.diagramView.core.vrManager.getController(controllerId);
    }

    get keyPressedMap(): ReadonlyMap<Controller, ReadonlySet<GAMEPAD_BUTTON>> {
        return this._keyPressedMap;
    }

    private subscribeOnControllers() {
        for (let controllerId = 0; controllerId < CONTROLLERS_NUMBER; controllerId++) {
            const controller = this.diagramView.core.vrManager.getController(controllerId);
            if (!controller) { continue; }
            this._keyPressedMap.set(controller, new Set());
            const onDragStart = () => {
                this._keyPressedMap.get(controller).add(GAMEPAD_BUTTON.TRIGGER);
                this.trigger('keyDown', {
                    controller, button: GAMEPAD_BUTTON.TRIGGER,
                });
                if (!subscription.isDragging) {
                    this.onDragStartEvent(controller);
                }
            };
            const onDragEnd = () => {
                this._keyPressedMap.get(controller).delete(GAMEPAD_BUTTON.TRIGGER);
                this.trigger('keyUp', {
                    controller, button: GAMEPAD_BUTTON.TRIGGER,
                });
                this.onDragEndEvent(subscription);
            };

            const subscription: ControllerSubscription = {
                controller,
                unsubscribe: () => {
                    controller.removeEventListener('selectstart', onDragStart);
                    controller.removeEventListener('selectend', onDragEnd);
                    controller.removeEventListener('squeezestart', onDragStart);
                    controller.removeEventListener('squeezeend', onDragEnd);
                },
            };
            this.subscriptions.set(controller, subscription);
            controller.addEventListener('selectstart', onDragStart);
            controller.addEventListener('selectend', onDragEnd);
            controller.addEventListener('squeezestart', onDragStart);
            controller.addEventListener('squeezeend', onDragEnd);
        }
    }

    private unsubscribeFromController() {
        for (let controllerId = 0; controllerId < CONTROLLERS_NUMBER; controllerId++) {
            const controller = this.diagramView.core.vrManager.getController(controllerId);
            if (!controller) { continue; }
            const subscription = this.subscriptions.get(controller);
            subscription.unsubscribe();
            this.subscriptions.delete(controller);
        }
    }

    private draggedBy = (element: Element) => {
        let dragged: ControllerSubscription;
        this.subscriptions.forEach(subscription => {
            if (element === subscription.target && !dragged) {
                dragged = subscription;
            }
        });
        return dragged;
    }

    private onDragStartEvent(controller: Controller) {
        const target = this.targets.get(controller);
        const subscription = this.subscriptions.get(controller);
        if (target) {
            const draggedBy = this.draggedBy(target);
            if (draggedBy) {
                draggedBy.dragCompanion = subscription;
                subscription.dragCompanionFor = draggedBy;
            } else {
                startDragging(
                    target,
                    this.diagramView,
                    subscription,
                );

                this.trigger('elementDragStart', {
                    target,
                    position: subscription.position,
                });
            }
        }
    }

    private onDrag(subscription: ControllerSubscription) {
        if (!(subscription && subscription.isDragging && !subscription.dragCompanionFor)) {
            return;
        }

        dragElement(this.diagramView, subscription);

        this.trigger('elementDrag', {
            target: subscription.target,
            position: subscription.position,
        });
    }

    private onDragEndEvent(subscription: ControllerSubscription) {
        if (subscription.dragCompanionFor) {
            subscription.dragCompanionFor.dragCompanion = undefined;
        }
        if (!subscription.isDragging) { return; }
        const target = subscription.target;

        if (subscription.dragCompanion) {
            subscription.dragCompanion.dragCompanionFor = undefined;
            startDragging(
                target,
                this.diagramView,
                subscription.dragCompanion,
            );

            this.trigger('elementDragStart', {
                target,
                position: subscription.position,
            });
        }
        stopDragging(subscription, this.diagramView, subscription.controller);

        this.trigger('elementDragEnd', {
            target,
            position: subscription.position,
        });
    }

    private handlerTimeLoop() {
        for (let controllerId = 0; controllerId < CONTROLLERS_NUMBER; controllerId++) {
            const controller = this.diagramView.core.vrManager.getController(controllerId);
            if (!controller) { continue; }
            const prevTarget = this.targets.get(controller);
            const target = this.getTarget(controller);
            if (prevTarget) {
                if (target && target === prevTarget) {
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
            this.onDrag(subscription);
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
        return this.diagramView.core.animationFrameInterval(() => {
            this.handlerTimeLoop();
        });
    }
}

function startDragging(
    target: Element,
    diagramView: DiagramView,
    subscription: ControllerSubscription,
) {
    if (target && target instanceof Node) {
        const elementMesh = diagramView.graphView.nodeViews.get(target).mesh;
        const mockObject = elementMesh.clone();
        mockObject.visible = false;
        attach(mockObject, subscription.controller, diagramView.core.scene);
        subscription.isDragging = true;
        subscription.mockObject = mockObject;
        subscription.targetParent = diagramView.core.scene;
        subscription.target = target;
        subscription.position = target.position;
        subscription.dragCompanionFor = undefined;
    }
}

// let line1: THREE.Line;
// let line2: THREE.Line;

function dragElement(
    diagramView: DiagramView,
    subscription: ControllerSubscription,
) {
    if (subscription) {
        attach(subscription.mockObject, diagramView.core.scene, diagramView.core.scene);
        if (subscription.dragCompanion) {
            const c1 = subscription.controller;
            const c2 = subscription.dragCompanion.controller;

            const v1 = {
                start: threeVector3ToVector3d(c1.position),
                end: threeVector3ToVector3d(
                    new THREE.Vector3(0, 0, -1)
                        .applyMatrix4(c1.matrixWorld)
                ),
            };
            const v2 = {
                start: threeVector3ToVector3d(c2.position),
                end: threeVector3ToVector3d(
                    new THREE.Vector3(0, 0, -1)
                        .applyMatrix4(c2.matrixWorld)
                ),
            };
            const maxDistance = diagramView.core.screenParameters.FAR;
            subscription.position = sum(
                multiply(
                    sub(
                        getCrossingPoint(v1, v2, maxDistance),
                        v1.start
                    ),
                    10,
                ),
                v1.start
            );
            // getCrossingPoint(v1, v2, maxDistance);

            // const material1 = new THREE.LineBasicMaterial( { color: 'green' } );
            // const material2 = new THREE.LineBasicMaterial( { color: 'blue' } );

            // const geometry1 = new THREE.BufferGeometry().setFromPoints([
            //     vector3dToTreeVector3(v1.start),
            //     vector3dToTreeVector3(v1.end),
            // ]);
            // const geometry2 = new THREE.BufferGeometry().setFromPoints([
            //     vector3dToTreeVector3(v2.start),
            //     vector3dToTreeVector3(v2.end),
            // ]);

            // if (line1) { diagramView.core.scene.remove(line1); }
            // line1 = new THREE.Line(geometry1, material1);
            // diagramView.core.scene.add(line1);
            // if (line2) { diagramView.core.scene.remove(line2); }
            // line2 = new THREE.Line(geometry2, material2);
            // diagramView.core.scene.add(line2);
            // diagramView.core.forceRender();
        } else {
            subscription.position = threeVector3ToVector3d(subscription.mockObject.position);
        }
        attach(subscription.mockObject, subscription.controller, diagramView.core.scene);
    }
}

// const sgeometry1 = new THREE.SphereGeometry(0.1, 32, 32);
// const smaterial1 = new THREE.MeshBasicMaterial({color: 'green'});
// const s1 = new THREE.Mesh(sgeometry1, smaterial1);

// const sgeometry2 = new THREE.SphereGeometry(0.1, 32, 32);
// const smaterial2 = new THREE.MeshBasicMaterial({color: 'blue'});
// const s2 = new THREE.Mesh(sgeometry2, smaterial2);

function getCrossingPoint(
    v1: { start: Vector3d; end: Vector3d },
    v2: { start: Vector3d; end: Vector3d },
    maxDistance: number,
): Vector3d {
    const direction1 = sub(v1.end, v1.start);
    const direction2 = sub(v2.end, v2.start);
    const getPointOnDirection = (
        direction: Vector3d,
        dist: number,
        offset: Vector3d,
    ) => sum(offset, multiply(direction, dist));

    const MAX_ITERATIONS = 16;
    let step = 2;
    let curPos = maxDistance / step;

    const returnResult = () => {
        const p1 = getPointOnDirection(direction1, curPos, v1.start);
        const p2 = getPointOnDirection(direction2, curPos, v2.start);
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
            z: (p1.z + p2.z) / 2,
        };
    };

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        step *= 2;
        const nextPos1 = curPos + maxDistance / step;
        const p1_1 = getPointOnDirection(direction1, nextPos1, v1.start);
        const p1_2 = getPointOnDirection(direction2, nextPos1, v2.start);
        const dist1 = distance(p1_1, p1_2);

        const nextPos2 = curPos - maxDistance / step;
        const p2_1 = getPointOnDirection(direction1, nextPos2, v1.start);
        const p2_2 = getPointOnDirection(direction2, nextPos2, v2.start);
        const dist2 = distance(p2_1, p2_2);
        // s1.position.set(v1.end.x, v1.end.y, v1.end.z);
        // s2.position.set(v2.end.x, v2.end.y, v2.end.z);
        if (dist1 < dist2) {
            // s1.position.set(p1_1.x, p1_1.y, p1_1.z);
            // s2.position.set(p1_2.x, p1_2.y, p1_2.z);
            curPos = curPos + maxDistance / step;
        } else if (dist1 > dist2) {
            // s1.position.set(p2_1.x, p2_1.y, p2_1.z);
            // s2.position.set(p2_2.x, p2_2.y, p2_2.z);
            curPos = curPos - maxDistance / step;
        } else {
            return returnResult();
        }
    }
    return returnResult();
}

function stopDragging(
    subscription: ControllerSubscription,
    diagramView: DiagramView,
    controller: Controller,
) {
    if (subscription) {
        if (controller) {
            attach(subscription.mockObject, subscription.targetParent, diagramView.core.scene);
            subscription.position = threeVector3ToVector3d(subscription.mockObject.position);
            detach(subscription.mockObject, subscription.mockObject.parent, diagramView.core.scene);
            subscription.target = undefined;
            subscription.mockObject = undefined;
            subscription.targetParent = undefined;
            subscription.isDragging = false;
            subscription.dragCompanionFor = undefined;
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
