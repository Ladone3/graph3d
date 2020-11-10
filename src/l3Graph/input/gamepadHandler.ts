import * as THREE from 'three';
import { Subscribable } from '../utils/subscribable';
import {
    threeVector3ToVector3d, multiply, distance, sub, sum, vector3dToTreeVector3, normalize, sumScalar
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

interface DragState {
    controller: Controller;
    unsubscribe: () => void;
    startControllerPosition?: Vector3d;
    startTargetPosition?: Vector3d;
    target?: Node;
    targetParent?: THREE.Object3D;
    isDragging?: boolean;
    mockObject?: THREE.Object3D;
    position?: Vector3d;
    dragCompanion?: DragState;
    dragCompanionFor?: DragState;
}

// It's currently support only OCULUS gamepads
export class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    private _keyPressedMap = new Map<Controller, Set<GAMEPAD_BUTTON>>();
    private targets = new Map<Controller, Element | undefined>();
    private dragStates = new Map<Controller, DragState>();

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
                if (!dragState.isDragging) {
                    this.onDragStartEvent(controller);
                }
            };
            const onDragEnd = () => {
                this._keyPressedMap.get(controller).delete(GAMEPAD_BUTTON.TRIGGER);
                this.trigger('keyUp', {
                    controller, button: GAMEPAD_BUTTON.TRIGGER,
                });
                this.onDragEndEvent(dragState);
            };

            const dragState: DragState = {
                controller,
                unsubscribe: () => {
                    controller.removeEventListener('selectstart', onDragStart);
                    controller.removeEventListener('selectend', onDragEnd);
                    controller.removeEventListener('squeezestart', onDragStart);
                    controller.removeEventListener('squeezeend', onDragEnd);
                },
            };
            this.dragStates.set(controller, dragState);
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
            const dragState = this.dragStates.get(controller);
            dragState.unsubscribe();
            this.dragStates.delete(controller);
        }
    }

    private draggedBy = (element: Element) => {
        let dragged: DragState;
        this.dragStates.forEach(dragState => {
            if (element === dragState.target && !dragged) {
                dragged = dragState;
            }
        });
        return dragged;
    }

    private onDragStartEvent(controller: Controller) {
        const target = this.targets.get(controller);
        const dragState = this.dragStates.get(controller);
        if (target) {
            const draggedBy = this.draggedBy(target);
            if (draggedBy) {
                startCompanionDragging(
                    target,
                    dragState,
                    draggedBy
                );
            } else {
                startDragging(
                    target,
                    this.diagramView,
                    dragState,
                );

                this.trigger('elementDragStart', {
                    target,
                    position: dragState.position,
                });
            }
        }
    }

    private onDrag(dragState: DragState) {
        if (!(dragState && dragState.isDragging && !dragState.dragCompanionFor)) {
            return;
        }

        dragElement(this.diagramView, dragState);

        this.trigger('elementDrag', {
            target: dragState.target,
            position: dragState.position,
        });
    }

    private onDragEndEvent(dragState: DragState) {
        stopDragging(dragState, this.diagramView);
        if (!dragState.isDragging) { return; }
        const target = dragState.target;

        this.trigger('elementDragEnd', {
            target,
            position: dragState.position,
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
            const dragState = this.dragStates.get(controller);
            this.onDrag(dragState);
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
    dragState: DragState,
) {
    if (target && target instanceof Node) {
        const mockObject = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({color: 'red'})
        );
        mockObject.position.set(target.position.x, target.position.y, target.position.z);
        mockObject.visible = false;
        attach(mockObject, dragState.controller, diagramView.core.scene);
        dragState.isDragging = true;
        dragState.mockObject = mockObject;
        dragState.targetParent = diagramView.core.scene;
        dragState.target = target;
        dragState.position = target.position;
        dragState.dragCompanionFor = undefined;
        dragState.startControllerPosition = threeVector3ToVector3d(dragState.controller.position);
        dragState.startTargetPosition = dragState.target.position;
    }
}

function startCompanionDragging(
    target: Element,
    dragState: DragState,
    dragBase: DragState,
) {
    if (target && target instanceof Node) {
        dragBase.dragCompanion = dragState;
        dragState.dragCompanionFor = dragBase;
        dragState.startControllerPosition = threeVector3ToVector3d(dragState.controller.position);
        dragState.startTargetPosition = dragState.target.position;
    }
}

function dragElement(
    diagramView: DiagramView,
    dragState: DragState,
) {
    if (dragState) {
        attach(dragState.mockObject, diagramView.core.scene, diagramView.core.scene);
        if (dragState.dragCompanion) {
            dragState.position = getNewPosition(
                dragState,
                dragState.dragCompanion,
                diagramView.core.screenParameters.FAR
            );
            dragState.mockObject.position.set(dragState.position.x, dragState.position.y, dragState.position.z);
        } else {
            dragState.position = threeVector3ToVector3d(dragState.mockObject.position);
        }
        attach(dragState.mockObject, dragState.controller, diagramView.core.scene);
    }
}

function getNewPosition(
    baseState: DragState,
    companionState: DragState,
    maxDistance: number,
): Vector3d {
    const direction1 = sub(
        threeVector3ToVector3d(
            new THREE.Vector3(0, 0, -1)
                .applyMatrix4(baseState.controller.matrixWorld)
        ),
        threeVector3ToVector3d(baseState.controller.position)
    );
    const direction2 = sub(
        threeVector3ToVector3d(
            new THREE.Vector3(0, 0, -1)
                .applyMatrix4(companionState.controller.matrixWorld)
        ),
        threeVector3ToVector3d(companionState.controller.position)
    );

    const startDist = distance(
        baseState.startControllerPosition,
        companionState.startControllerPosition
    );
    const curDist = distance(baseState.controller.position, companionState.controller.position);
    const k = Math.pow(curDist / startDist, 2);
    const initialTargetDist = distance(baseState.startTargetPosition, baseState.startControllerPosition);

    const p1 = sum(
        baseState.controller.position,
        multiply(
            direction1,
            Math.min(
                initialTargetDist * k,
                maxDistance,
            )
        )
    );
    const p2 = sum(
        baseState.controller.position,
        multiply(
            direction2,
            Math.min(
                initialTargetDist * k,
                maxDistance,
            )
        )
    );
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        z: (p1.z + p2.z) / 2,
    };
}

function getNewPositionOld(
    baseState: DragState,
    companionState: DragState,
    maxDistance: number,
): Vector3d {
    const c1 = baseState.controller;
    const c2 = companionState.controller;

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
    return sum(
        multiply(
            sub(
                getCrossingPoint(v1, v2, maxDistance),
                v1.start
            ),
            10,
        ),
        v1.start
    );
}

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
        if (dist1 < dist2) {
            curPos = curPos + maxDistance / step;
        } else if (dist1 > dist2) {
            curPos = curPos - maxDistance / step;
        } else {
            return returnResult();
        }
    }
    return returnResult();
}

function stopDragging(
    dragState: DragState,
    diagramView: DiagramView,
) {
    if (dragState.dragCompanionFor) {
        dragState.dragCompanionFor.dragCompanion = undefined;
    }
    if (dragState.dragCompanion) {
        dragState.dragCompanion.dragCompanionFor = undefined;
    }
    attach(dragState.mockObject, dragState.targetParent, diagramView.core.scene);
    dragState.position = threeVector3ToVector3d(dragState.mockObject.position);
    detach(dragState.mockObject, dragState.mockObject.parent, diagramView.core.scene);
    dragState.target = undefined;
    dragState.mockObject = undefined;
    dragState.targetParent = undefined;
    dragState.isDragging = false;
    dragState.dragCompanionFor = undefined;
    dragState.dragCompanion = undefined;
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
