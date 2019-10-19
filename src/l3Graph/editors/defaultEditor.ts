import * as THREE from 'three';
import { vector3DToTreeVector3, KeyHandler, KEY_CODES, EventObject, treeVector3ToVector3D } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Element } from '../models/graph/graphModel';
import { MouseHandler } from '../utils/mouseHandler';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { GamepadHandler, GAMEPAD_BUTTONS, OCULUS_CONTROLLERS } from '../vrUtils/gamepadHandler';

const WHEEL_STEP = 100;
const MIN_DISTANCE_TO_CAMERA = 10;
const GAMEPAD_EXTRA_MOVE_STEP = 10;

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
        this.gamepadHandler.on('keyDown', event => this.onKeyDown(event.data))
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

    private rightTargetParent: THREE.Object3D;
    private leftTargetParent: THREE.Object3D;
    private rightMockObj: THREE.Object3D;
    private leftMockObj: THREE.Object3D;

    private onKeyDown = (keyMap: Map<GAMEPAD_BUTTONS, Element>) => {
        const leftTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.LEFT_TRIGGER);
        if (leftTrigerTarget && leftTrigerTarget instanceof Node) {
            const controller = this.diagramView.renderer.vr.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
            const elementMesh = this.diagramView.graphView.views.get(leftTrigerTarget.id).mesh;
            this.leftMockObj = elementMesh.clone();
            this.leftMockObj.visible = false;
            this.diagramView.scene.add(this.leftMockObj);
            if (controller) {
                this.leftTargetParent = this.leftMockObj.parent;
                attach(this.leftMockObj, controller, this.diagramView.scene);
            }
        }

        const rightTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.RIGHT_TRIGGER);
        if (rightTrigerTarget && rightTrigerTarget instanceof Node) {
            const controller = this.diagramView.renderer.vr.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
            const elementMesh = this.diagramView.graphView.views.get(rightTrigerTarget.id).mesh;
            this.rightMockObj = elementMesh.clone();
            this.rightMockObj.visible = false;
            this.diagramView.scene.add(this.rightMockObj);
            if (controller) {
                this.rightTargetParent = this.rightMockObj.parent;
                attach(this.rightMockObj, controller, this.diagramView.scene);
            }
        }

        if (rightTrigerTarget || leftTrigerTarget) {
            this.gamepadHandler.on('keyUp', this.onKeyUp);
            this.gamepadHandler.on('keyPressed', this.onKeyMove);
        }
    }

    private onKeyUp = (event: EventObject<'keyUp', Map<GAMEPAD_BUTTONS, Element>>) => {
        const keyMap = event.data;

        const rightTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.RIGHT_TRIGGER);
        if (rightTrigerTarget && rightTrigerTarget instanceof Node) {
            const controller = this.diagramView.renderer.vr.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
            if (this.rightMockObj && controller) {
                attach(this.rightMockObj, this.rightTargetParent, this.diagramView.scene);
                rightTrigerTarget.setPosition(treeVector3ToVector3D(this.rightMockObj.position));
                this.rightTargetParent = undefined;
            }
        }

        const leftTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.LEFT_TRIGGER);
        if (leftTrigerTarget && leftTrigerTarget instanceof Node && rightTrigerTarget !== leftTrigerTarget) {
            const controller = this.diagramView.renderer.vr.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
            if (this.leftMockObj && controller) {
                attach(this.leftMockObj, this.leftTargetParent, this.diagramView.scene);
                leftTrigerTarget.setPosition(treeVector3ToVector3D(this.leftMockObj.position));
                this.leftTargetParent = undefined;
            }
        }

        if (!(this.rightTargetParent && this.leftTargetParent)) {
            this.gamepadHandler.unsubscribe(this.onKeyUp)
            this.gamepadHandler.unsubscribe(this.onKeyMove)
        }
    }

    private onKeyMove = (event: EventObject<'keyPressed', Map<GAMEPAD_BUTTONS, Element>>) => {
        const keyMap = event.data;

        const leftTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.LEFT_TRIGGER);
        if (leftTrigerTarget && leftTrigerTarget instanceof Node) {
            const moveForward = keyMap.has(GAMEPAD_BUTTONS.Y);
            const moveBackward = keyMap.has(GAMEPAD_BUTTONS.X);

            const controller = this.diagramView.renderer.vr.getController(OCULUS_CONTROLLERS.LEFT_CONTROLLER);
            if (this.leftMockObj && controller) {
                if (moveForward || moveBackward) {
                    this.leftMockObj.position.setZ(
                        this.leftMockObj.position.z + (
                            moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : GAMEPAD_EXTRA_MOVE_STEP
                        )
                    );
                }
                attach(this.leftMockObj, this.diagramView.scene, this.diagramView.scene);
                leftTrigerTarget.setPosition(treeVector3ToVector3D(this.leftMockObj.position));
                attach(this.leftMockObj, controller, this.diagramView.scene);
            }
        }

        const rightTrigerTarget = keyMap.get(GAMEPAD_BUTTONS.RIGHT_TRIGGER);
        if (rightTrigerTarget && rightTrigerTarget instanceof Node) {
            const moveForward = keyMap.has(GAMEPAD_BUTTONS.B);
            const moveBackward = keyMap.has(GAMEPAD_BUTTONS.A);

            const controller = this.diagramView.renderer.vr.getController(OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
            if (this.rightMockObj && controller) {
                if (moveForward || moveBackward) {
                    this.rightMockObj.position.setZ(
                        this.rightMockObj.position.z + (
                            moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : GAMEPAD_EXTRA_MOVE_STEP
                        )
                    );
                }
                attach(this.rightMockObj, this.diagramView.scene, this.diagramView.scene);
                rightTrigerTarget.setPosition(treeVector3ToVector3D(this.rightMockObj.position));
                attach(this.rightMockObj, controller, this.diagramView.scene);
            }
        }
    }

    onElementDrag(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element) {
        if (target instanceof Link) { return; }
        if (event instanceof TouchEvent && event.touches.length === 0) { return; }

        const nodeThreePos = vector3DToTreeVector3(target.position);
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

function isMouseWheelEvent(e: any): e is MouseWheelEvent {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}

function attach(child: THREE.Object3D, to: THREE.Object3D, scene: THREE.Scene) {
    if (child.parent) { _detach(child, child.parent, scene); }
    _attach(child, scene, to);
}

function _detach(child: THREE.Object3D, parent: THREE.Object3D, scene: THREE.Scene) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
};

function _attach(child: THREE.Object3D, scene: THREE.Scene, parent: THREE.Object3D) {
    child.applyMatrix( new THREE.Matrix4().getInverse( parent.matrixWorld ) );

    scene.remove(child);
    parent.add(child);
};