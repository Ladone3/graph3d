import * as THREE from 'three';
import { Subscribable } from '../utils/subscribeable';
import {
    Cancellation, animationFrameInterval,
    threeVector3ToVector3d, getModelFittingBox
} from '../utils';
import { VrEvent } from './webVr';
import { Element } from '../models/graph/graphModel';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView, DEFAULT_SCREEN_PARAMETERS } from '../views/diagramView';
import { mapMeshes } from '../utils/mouseHandler';
import { Node } from '../models/graph/node';
import { Vector3d } from '../models/structures';

export type Controller = THREE.Group;

/**
 * This function should return
 * the function which restore the initial state of the highlighted mesh
 */
export type Highligter = (mesh: THREE.Object3D) => (mesh: THREE.Object3D) => void;

interface HighlightingRestorer {
    mesh: THREE.Object3D;
    restore: (mesh: THREE.Object3D) => void;
}

export interface ElementBearer {
    dragKey: GAMEPAD_BUTTON;
    dragToKey: GAMEPAD_BUTTON;
    dragFromKey: GAMEPAD_BUTTON;
}

interface ActiveElementBearer extends ElementBearer {
    targetParent?: THREE.Object3D;
    mockObject?: THREE.Object3D;
    position?: Vector3d;
    target?: Node;
}

export interface GamepadDragEventData {
    target: Element;
    position: Vector3d;
}

export interface GamepadHandlerEvents {
    'keyDown': Map<GAMEPAD_BUTTON, Element | undefined>;
    'keyUp': Map<GAMEPAD_BUTTON, Element | undefined>;
    'keyPressed': Map<GAMEPAD_BUTTON, Element | undefined>;
    'elementDragStart': GamepadDragEventData;
    'elementDrag': GamepadDragEventData;
    'elementDragEnd': GamepadDragEventData;
}

const GAMEPAD_EXTRA_MOVE_STEP = 10;
const OCULUS_BUTTON_CODES = {
    NIPPLE: 0,
    TRIGGER: 1,
    GRUBBER: 2,
    A_X: 3,
    B_Y: 4,
    OCULUS_MENU: 5, // Probably '5' but it's not stable. Five also appears at nipple changing axis
};

export enum GAMEPAD_BUTTON {
    LEFT_NIPPLE = 'LEFT_NIPPLE',
    RIGHT_NIPPLE = 'RIGHT_NIPPLE',
    LEFT_TRIGGER = 'LEFT_TRIGGER',
    RIGHT_TRIGGER = 'RIGHT_TRIGGER',
    LEFT_GRUBBER = 'LEFT_GRUBBER',
    RIGHT_GRUBBER = 'RIGHT_GRUBBER',
    A = 'A',
    B = 'B',
    X = 'X',
    Y = 'Y',
    OCULUS = 'OCULUS',
    MENU = 'MENU',
}

export const OCULUS_CONTROLLERS = {
    LEFT_CONTROLLER: 1,
    RIGHT_CONTROLLER: 0,
};

export const CONTROLLERS_NUMBER = Object.keys(OCULUS_CONTROLLERS).length;

// It's currently support only OCULUS gamepads
export class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    public readonly keyPressed = new Map<GAMEPAD_BUTTON, Element | undefined>();

    private bearers = new Map<Controller, ActiveElementBearer>();
    private highlighters = new Map<Controller, Highligter>();

    private cancellation: Cancellation | undefined;
    private existingControllersNumber = 0;
    private raycaster: THREE.Raycaster;
    private tempMatrix: THREE.Matrix4;

    private highlightingRestorers = new Map<Controller, HighlightingRestorer>();
    private elementToController = new Map<THREE.Object3D, Controller>();

    constructor(
        private diagramhModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        super();
        this.raycaster = new THREE.Raycaster();
        this.tempMatrix = new THREE.Matrix4();
        window.addEventListener('vrdisplaypresentchange', event => {
            const vrEvent = event as VrEvent;
            if (vrEvent.display.isPresenting) {
                this.switchOn();
            } else {
                this.switchOff();
            }
        }, false );
    }

    public registerHighligter(controller: Controller, highlighter: Highligter) {
        this.highlighters.set(controller, highlighter);
    }

    public registerElementBearer(controller: Controller, bearer: ElementBearer) {
        this.bearers.set(controller, bearer);
    }

    private handleDraggingStart(keyDownMap: Map<GAMEPAD_BUTTON, Element>) {
        this.bearers.forEach((bearer, controller) => {
            if (keyDownMap.has(bearer.dragKey)) {
                const target = this.keyPressed.get(bearer.dragKey);
                startDragging(
                    target,
                    this.diagramView,
                    controller,
                    bearer,
                );

                this.trigger('elementDragStart', {
                    target,
                    position: bearer.position,
                });
            }
        });
    }

    private handleDragging() {
        this.bearers.forEach((bearer, controller) => {
            const moveForward = this.keyPressed.has(bearer.dragFromKey);
            const moveBackward = this.keyPressed.has(bearer.dragToKey);

            if (this.keyPressed.has(bearer.dragKey) && bearer.target) {
                draggElement(
                    this.diagramView,
                    moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : moveBackward ? GAMEPAD_EXTRA_MOVE_STEP : 0,
                    controller,
                    bearer,
                );

                this.trigger('elementDrag', {
                    target: bearer.target,
                    position: bearer.position,
                });
            }
        });
    }

    private handleDraggingEnd(keyUpMap: Map<GAMEPAD_BUTTON, Element>) {
        this.bearers.forEach((bearer, controller) => {
            if (keyUpMap.has(bearer.dragKey) && bearer.target) {
                stopDragging(bearer, this.diagramView, controller);

                this.trigger('elementDragEnd', {
                    target: bearer.target,
                    position: bearer.position,
                });
            }
        });
    }

    private switchOn() {
        this.cancellation = this.start();
    }

    private switchOff() {
        if (!this.cancellation) { return; }
        this.cancellation.stop();
        this.cancellation = undefined;
    }

    private updateBtnMap() {
        const keyDown = new Map<GAMEPAD_BUTTON, Element | undefined>();
        const keyUp = new Map<GAMEPAD_BUTTON, Element | undefined>();
        let gamepadNumber = 0;
        for (let gamepadId = 0; gamepadId < CONTROLLERS_NUMBER; gamepadId++) {
            const controller = this.diagramView.vrManager.getController(gamepadId);
            const gamepad = getGamepad(gamepadId);
            const gamepadExists = gamepad !== undefined && gamepad.pose;
            if (gamepadExists) {
                const target = this.getTarget(controller);
                this.updateHighlighting(controller, target);

                gamepadNumber++;
                for (let buttonId = 0; buttonId < gamepad.buttons.length; buttonId++) {
                    if (buttonId === OCULUS_BUTTON_CODES.OCULUS_MENU) { // ignore these buttons
                        continue;
                    }
                    const button = getOculusButton(gamepadId, buttonId);
                    const wasPressed = this.keyPressed.has(button);
                    const isPressed = gamepad.buttons[buttonId].pressed;
                    if (isPressed && !wasPressed) {
                        keyDown.set(button, target);
                        this.keyPressed.set(button, target);
                    } else if (wasPressed && !isPressed) {
                        keyUp.set(button, this.keyPressed.get(button));
                        this.keyPressed.delete(button);
                    }
                }
            }
        }
        if (keyUp.size > 0) {
            this.trigger('keyUp', keyUp);
            this.handleDraggingEnd(keyUp);
        }
        if (keyDown.size > 0) {
            this.trigger('keyDown', keyDown);
            this.handleDraggingStart(keyDown);
        }
        if (this.keyPressed.size > 0) {
            this.trigger('keyPressed', this.keyPressed);
            this.handleDragging();
        }
        if (gamepadNumber !== this.existingControllersNumber) { this.existingControllersNumber = gamepadNumber; }
    }

    private getTarget(controller: Controller): Element | undefined {
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);
        this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
        const {meshes, nodeMeshMap} = mapMeshes(this.diagramhModel, this.diagramView);

        const intersections = this.raycaster.intersectObjects(meshes);

        if (intersections.length > 0) {
            const intersectedMesh = intersections[0].object;
            const index = meshes.indexOf(intersectedMesh);
            return nodeMeshMap[index];
        } else {
            return undefined;
        }
    }

    private updateHighlighting(controller: Controller, newTarget?: Element) {
        if (!this.highlighters.has(controller)) { return; }

        const restorer = this.highlightingRestorers.get(controller);
        if (newTarget) {
            const view = this.diagramView.graphView.views.get(newTarget.id);
            const targetMesh = view.mesh;
            const meshIsChanged = !restorer || restorer.mesh !== targetMesh;
            if (meshIsChanged) {
                if (this.elementToController.has(targetMesh)) { return; }
                if (restorer) {
                    restorer.restore(restorer.mesh);
                    this.elementToController.delete(targetMesh);
                }
                const highlight = this.highlighters.get(controller);
                const restoreFunction = highlight(targetMesh);
                this.highlightingRestorers.set(controller, {
                    mesh: targetMesh,
                    restore: restoreFunction,
                });
                this.elementToController.set(targetMesh, controller);
            }
        } else {
            if (restorer) {
                this.highlightingRestorers.delete(controller);
                this.elementToController.delete(restorer.mesh);
                restorer.restore(restorer.mesh);
            }
        }
    }

    private start(): Cancellation {
        if (this.cancellation) { return this.cancellation; }
        return animationFrameInterval(() => {
            this.updateBtnMap();
        });
    }
}

function getOculusButton(gamepadId: number, buttonCode: number) {
    switch (buttonCode) {
        case OCULUS_BUTTON_CODES.TRIGGER:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.LEFT_TRIGGER;
            } else {
                return GAMEPAD_BUTTON.RIGHT_TRIGGER;
            }
        case OCULUS_BUTTON_CODES.GRUBBER:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.LEFT_GRUBBER;
            } else {
                return GAMEPAD_BUTTON.RIGHT_GRUBBER;
            }
        case OCULUS_BUTTON_CODES.NIPPLE:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.LEFT_NIPPLE;
            } else {
                return GAMEPAD_BUTTON.RIGHT_NIPPLE;
            }
        case OCULUS_BUTTON_CODES.A_X:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.X;
            } else {
                return GAMEPAD_BUTTON.A;
            }
        case OCULUS_BUTTON_CODES.B_Y:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.Y;
            } else {
                return GAMEPAD_BUTTON.B;
            }
        case OCULUS_BUTTON_CODES.OCULUS_MENU:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.MENU;
            } else {
                return GAMEPAD_BUTTON.OCULUS;
            }
        default:
            return undefined;
    }
}

function getGamepad(id: number): Gamepad | undefined {
    const gamepads = navigator.getGamepads && navigator.getGamepads();

    for (let i = 0, j = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad && (
            gamepad.id === 'Daydream Controller' ||
            gamepad.id === 'Gear VR Controller' ||
            gamepad.id === 'Oculus Go Controller' ||
            gamepad.id === 'OpenVR Gamepad' ||
            gamepad.id.startsWith('Oculus Touch') ||
            gamepad.id.startsWith('Spatial Controller')
        )) {
            if (j === id) {
                return gamepad;
            }
            j++;
        }
    }
}

function startDragging(
    target: Element,
    diagramView: DiagramView,
    controller: Controller,
    bearer: ActiveElementBearer,
) {
    if (target && target instanceof Node) {
        const elementMesh = diagramView.graphView.views.get(target.id).mesh;
        if (controller) {
            const mockObject = elementMesh.clone();
            mockObject.visible = false;
            attach(mockObject, controller, diagramView.scene);
            bearer.mockObject = mockObject;
            bearer.targetParent = diagramView.scene;
            bearer.target = target;
        }
    }
}

function draggElement(
    diagramView: DiagramView,
    zOffset: number,
    controller: Controller,
    bearer: ActiveElementBearer,
) {
    if (bearer) {
        if (controller) {
            attach(bearer.mockObject, diagramView.scene, diagramView.scene);
            bearer.position = threeVector3ToVector3d(bearer.mockObject.position);
            attach(bearer.mockObject, controller, diagramView.scene);
            if (zOffset !== 0) {
                const dist = bearer.mockObject.position.z + zOffset;
                const fittingBox = getModelFittingBox(bearer.target.size);
                const limitedValue =  Math.max(
                    Math.min(
                        Math.abs(dist),
                        DEFAULT_SCREEN_PARAMETERS.FAR,
                    ),
                    DEFAULT_SCREEN_PARAMETERS.NEAR + fittingBox.deep / 2)
                ;
                bearer.mockObject.position.setZ(dist > 0 ? limitedValue : -limitedValue);
            }
        }
    }
}

function stopDragging(
    bearer: ActiveElementBearer,
    diagramView: DiagramView,
    controller: Controller,
) {
    if (bearer) {
        if (controller) {
            attach(bearer.mockObject, bearer.targetParent, diagramView.scene);
            bearer.position = threeVector3ToVector3d(bearer.mockObject.position);
            detach(bearer.mockObject, bearer.mockObject.parent, diagramView.scene);
            bearer.target = undefined;
            bearer.mockObject = undefined;
            bearer.targetParent = undefined;
        }
    }
}

function attach(child: THREE.Object3D, to: THREE.Object3D, scene: THREE.Scene) {
    if (child.parent) { detach(child, child.parent, scene); }
    _attach(child, scene, to);
}

function detach(child: THREE.Object3D, parent: THREE.Object3D, scene: THREE.Scene) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
}

function _attach(child: THREE.Object3D, scene: THREE.Scene, parent: THREE.Object3D) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));
    scene.remove(child);
    parent.add(child);
}
