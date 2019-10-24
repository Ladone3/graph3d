import * as THREE from 'three';
import { vector3dToTreeVector3, KeyHandler, KEY_CODES, EventObject, threeVector3ToVector3d, sum, getModelFittingBox } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView, DEFAULT_SCREEN_PARAMETERS } from '../views/diagramView';
import { Element } from '../models/graph/graphModel';
import { MouseHandler } from '../utils/mouseHandler';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { GamepadHandler, GAMEPAD_BUTTONS, OCULUS_CONTROLLERS } from '../vrUtils/gamepadHandler';

const WHEEL_STEP = 100;
const MIN_DISTANCE_TO_CAMERA = 10;
const GAMEPAD_EXTRA_MOVE_STEP = 10;

interface GamepadDraggingHelper {
    targetParent: THREE.Object3D,
    mockObject: THREE.Object3D,
    node: Node, 
}

export class DefaultEditor {
    constructor(
        private diagramModel: DiagramModel,
        private diagramView: DiagramView,
        private mouseHandler: MouseHandler,
        private keyHandler: KeyHandler,
        private gamepadHandler: GamepadHandler
    ) {
        this.mouseHandler.on('elementClick', e => {
            this.diagramModel.selection.setSelection(new Set([e.data.element]));
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('paperClick', e => {
            this.diagramModel.selection.setSelection(new Set());
            e.data.stopPropagation();
        });
        this.mouseHandler.on('elementStartDrag', e => {
            this.onElementDrag(e.data.nativeEvent, e.data.element);
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('elementDrag', e => {
            this.onElementDrag(e.data.nativeEvent, e.data.element);
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('elementEndDrag', e => {
            this.onElementDragEnd(e.data.nativeEvent, e.data.element);
            e.data.nativeEvent.stopPropagation();
        });

        this.keyHandler.on('keyPressed', e => this.onKeyPressed(e.data));
        this.gamepadHandler.on('keyDown', event => this.onGamepadDown(event.data))
    }

    private onKeyPressed(keyMap: Set<number>) {
        if (keyMap.has(KEY_CODES.DELETE) && this.diagramModel.selection.elements.size > 0) {
            const nodesToDelete: Node[] = [];
            const linksToDelete: Link[] = [];
            this.diagramModel.selection.elements.forEach(el => {
                if (el instanceof Node) {
                    nodesToDelete.push(el);
                } else {
                    linksToDelete.push(el);
                }
            });
            this.diagramModel.graph.removeLinks(linksToDelete);
            this.diagramModel.graph.removeNodes(nodesToDelete);
        }
    }

    private helperMap = new Map<number, GamepadDraggingHelper>();

    private onGamepadDown = (keyMap: Map<GAMEPAD_BUTTONS, Element>) => {
        const leftTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.LEFT_TRIGGER);
        const leftDraggingHelper = registerHelper(
            this.diagramView, OCULUS_CONTROLLERS.LEFT_CONTROLLER, leftTrigerTarget, this.helperMap,
        );

        const rightTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.RIGHT_TRIGGER);
        const rightDraggingHelper = registerHelper(
            this.diagramView, OCULUS_CONTROLLERS.RIGHT_CONTROLLER, rightTrigerTarget, this.helperMap,
        );

        if (leftDraggingHelper || rightDraggingHelper) {
            this.gamepadHandler.on('keyUp', this.onGamepadUp);
            this.gamepadHandler.on('keyPressed', this.onGamepadMove);
        }
    }

    private onGamepadUp = (event: EventObject<'keyUp', Map<GAMEPAD_BUTTONS, Element>>) => {
        const keyMap = event.data;
        if (keyMap.has(GAMEPAD_BUTTONS.LEFT_TRIGGER)) {
            deleteHelper(this.diagramView, OCULUS_CONTROLLERS.LEFT_CONTROLLER, this.helperMap);
        }
        if (keyMap.has(GAMEPAD_BUTTONS.RIGHT_TRIGGER)) {
            deleteHelper(this.diagramView, OCULUS_CONTROLLERS.RIGHT_CONTROLLER, this.helperMap);
        }

        if (this.helperMap.size === 0) {
            this.gamepadHandler.unsubscribe(this.onGamepadUp)
            this.gamepadHandler.unsubscribe(this.onGamepadMove)
        }
    }

    private onGamepadMove = (event: EventObject<'keyPressed', Map<GAMEPAD_BUTTONS, Element>>) => {
        const keyMap = event.data;

        if (this.helperMap.has(OCULUS_CONTROLLERS.LEFT_CONTROLLER)) {
            const moveForward = keyMap.has(GAMEPAD_BUTTONS.Y);
            const moveBackward = keyMap.has(GAMEPAD_BUTTONS.X);

            onKeyMove(
                this.diagramView,
                moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : moveBackward ? GAMEPAD_EXTRA_MOVE_STEP : 0,
                OCULUS_CONTROLLERS.LEFT_CONTROLLER,
                this.helperMap,
            );
        }

        if (this.helperMap.has(OCULUS_CONTROLLERS.RIGHT_CONTROLLER)) {
            const moveForward = keyMap.has(GAMEPAD_BUTTONS.B);
            const moveBackward = keyMap.has(GAMEPAD_BUTTONS.A);

            onKeyMove(
                this.diagramView,
                moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : moveBackward ? GAMEPAD_EXTRA_MOVE_STEP : 0,
                OCULUS_CONTROLLERS.RIGHT_CONTROLLER,
                this.helperMap,
            );
        }
    }

    onElementDrag(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element) {
        if (target instanceof Link) { return; }
        if (event instanceof TouchEvent && event.touches.length === 0) { return; }

        const nodeThreePos = vector3dToTreeVector3(target.position);
        const cameraPos = this.diagramView.camera.position;
        let distanceToNode = nodeThreePos.distanceTo(cameraPos);
        if (isMouseWheelEvent(event)) {
            const delata = -(event.deltaX || event.deltaY || event.deltaZ);
            distanceToNode += (delata > 0 ? 1 : -1) * WHEEL_STEP;
        }
        const size = target.size;
        const minDist = Math.max(size.x, size.y, size.z) / 2 + MIN_DISTANCE_TO_CAMERA;
        const limitedDistance = Math.max(distanceToNode, minDist);
        const newNodePosition = this.diagramView.mouseTo3dPos(event, limitedDistance);
        target.setPosition(newNodePosition);
    }

    onElementDragEnd(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element) {
        this.onElementDrag(event, target);
    }
}

function registerHelper(
    diagramView: DiagramView,
    controllerId: number,
    trigerTarget: Element,
    helperMap: Map<number, GamepadDraggingHelper>,
): GamepadDraggingHelper | undefined {
    if (trigerTarget && trigerTarget instanceof Node) {
        const controller = diagramView.renderer.vr.getController(controllerId);
        const elementMesh = diagramView.graphView.views.get(trigerTarget.id).mesh;
        
        if (controller) {
            const mockObject = elementMesh.clone();
            mockObject.visible = false;
            attach(mockObject, controller, diagramView.scene);
            const helper = {
                mockObject,
                targetParent: diagramView.scene,
                node: trigerTarget,
            };

            helperMap.set(controllerId, helper);

            return helper;

        }
        return undefined;
        
    }
    return undefined;
}

function deleteHelper(
    diagramView: DiagramView,
    controllerId: number,
    helperMap: Map<number, GamepadDraggingHelper>,
) {
    const helper = helperMap.get(controllerId);
    if (helper) {
        const trigerTarget = helper.node;
        const controller = diagramView.renderer.vr.getController(controllerId);
        if (controller) {
            attach(helper.mockObject, helper.targetParent, diagramView.scene);
            trigerTarget.setPosition(threeVector3ToVector3d(helper.mockObject.position));
            detach(helper.mockObject, helper.mockObject.parent, diagramView.scene);
            helperMap.delete(controllerId);

        }
    }
}

function onKeyMove(
    diagramView: DiagramView,
    zOffset: number,
    controllerId: number,
    helperMap: Map<number, GamepadDraggingHelper>,
) {
    const helper = helperMap.get(controllerId);
    if (helper) {
        
        const controller = diagramView.renderer.vr.getController(controllerId);
        if (controller) {
            attach(helper.mockObject, diagramView.scene, diagramView.scene);
            helper.node.setPosition(threeVector3ToVector3d(helper.mockObject.position));
            attach(helper.mockObject, controller, diagramView.scene);

            if (zOffset !== 0) {
                const dist = helper.mockObject.position.z + zOffset;
                const fittingBox = getModelFittingBox(helper.node.size);
                const limitedValue =  Math.max(
                    Math.min(
                        Math.abs(dist),
                        DEFAULT_SCREEN_PARAMETERS.FAR,
                    ),
                    DEFAULT_SCREEN_PARAMETERS.NEAR + fittingBox.deep / 2)
                ;
                helper.mockObject.position.setZ(dist > 0 ? limitedValue : -limitedValue);
            }
        }
    }
}

function isMouseWheelEvent(e: any): e is MouseWheelEvent {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}

function attach(child: THREE.Object3D, to: THREE.Object3D, scene: THREE.Scene) {
    if (child.parent) { detach(child, child.parent, scene); }
    _attach(child, scene, to);
}

function detach(child: THREE.Object3D, parent: THREE.Object3D, scene: THREE.Scene) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
};

function _attach(child: THREE.Object3D, scene: THREE.Scene, parent: THREE.Object3D) {
    child.applyMatrix( new THREE.Matrix4().getInverse( parent.matrixWorld ) );

    scene.remove(child);
    parent.add(child);
};