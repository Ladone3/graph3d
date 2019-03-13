import * as THREE from 'three';
import { Subscribable } from '../utils/subscribable';
import { Element } from '../models/graph/graphModel';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Node } from '../models/graph/node';
import { Vector3d } from '../models/structures';
export declare type Controller = THREE.Group;
/**
 * This function should return
 * the function which restore the initial state of the highlighted mesh
 */
export declare type Highlighter = (mesh: THREE.Object3D) => (mesh: THREE.Object3D) => void;
export interface ElementBearer {
    dragKey: GAMEPAD_BUTTON;
    dragToKey: GAMEPAD_BUTTON;
    dragFromKey: GAMEPAD_BUTTON;
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
export declare const GAMEPAD_EXTRA_MOVE_STEP = 10;
export declare enum GAMEPAD_BUTTON {
    LEFT_NIPPLE = "LEFT_NIPPLE",
    RIGHT_NIPPLE = "RIGHT_NIPPLE",
    LEFT_TRIGGER = "LEFT_TRIGGER",
    RIGHT_TRIGGER = "RIGHT_TRIGGER",
    LEFT_GRUBBER = "LEFT_GRUBBER",
    RIGHT_GRUBBER = "RIGHT_GRUBBER",
    A = "A",
    B = "B",
    X = "X",
    Y = "Y",
    OCULUS = "OCULUS",
    MENU = "MENU"
}
export declare const OCULUS_CONTROLLERS: {
    LEFT_CONTROLLER: number;
    RIGHT_CONTROLLER: number;
};
export declare const CONTROLLERS_NUMBER: number;
export declare class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    private diagramModel;
    private diagramView;
    readonly keyPressed: Map<GAMEPAD_BUTTON, import("../..").Link<any> | Node<any>>;
    private bearers;
    private highlighters;
    private cancellation;
    private existingControllersNumber;
    private rayCaster;
    private tempMatrix;
    private highlightingRestorers;
    private elementToController;
    constructor(diagramModel: DiagramModel, diagramView: DiagramView);
    registerHighlighter(controller: Controller, highlighter: Highlighter): void;
    registerElementBearer(controller: Controller, bearer: ElementBearer): void;
    private handleDraggingStart;
    private handleDragging;
    private handleDraggingEnd;
    private switchOn;
    private switchOff;
    private updateBtnMap;
    private getTarget;
    private updateHighlighting;
    private start;
}
export declare function attach(child: THREE.Object3D, to: THREE.Object3D, scene: THREE.Scene): void;
export declare function detach(child: THREE.Object3D, parent: THREE.Object3D, scene: THREE.Scene): void;
export declare function _attach(child: THREE.Object3D, scene: THREE.Scene, parent: THREE.Object3D): void;
