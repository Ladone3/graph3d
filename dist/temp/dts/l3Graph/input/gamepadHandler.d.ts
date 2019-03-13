import * as THREE from 'three';
import { Subscribable } from '../utils/subscribable';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { DragHandlerEvents } from './dragHandler';
export declare type Controller = THREE.Group;
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
export declare const GAMEPAD_EXTRA_MOVE_STEP = 10;
export declare enum GAMEPAD_BUTTON {
    TRIGGER = "TRIGGER",
    GRUBBER = "GRUBBER"
}
export declare const OCULUS_CONTROLLERS: {
    LEFT_CONTROLLER: number;
    RIGHT_CONTROLLER: number;
};
export declare const CONTROLLERS_NUMBER: number;
export declare class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    private diagramModel;
    private diagramView;
    private _keyPressedMap;
    private targets;
    private subscriptions;
    private cancellation;
    private rayCaster;
    private tempMatrix;
    constructor(diagramModel: DiagramModel, diagramView: DiagramView);
    getController(controllerId: number): THREE.Group;
    readonly keyPressedMap: ReadonlyMap<Controller, ReadonlySet<GAMEPAD_BUTTON>>;
    private subscribeOnControllers;
    private unsubscribeFromController;
    private draggedBy;
    private onDragStartEvent;
    private onDrag;
    private onDragEndEvent;
    private handlerTimeLoop;
    private getTarget;
    private start;
}
export declare function attach(child: THREE.Object3D, to: THREE.Object3D, scene: THREE.Scene): void;
export declare function detach(child: THREE.Object3D, parent: THREE.Object3D, scene: THREE.Scene): void;
export declare function _attach(child: THREE.Object3D, scene: THREE.Scene, parent: THREE.Object3D): void;
