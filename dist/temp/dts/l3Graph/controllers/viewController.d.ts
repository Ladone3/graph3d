import { DiagramView } from '../views/diagramView';
import { Vector3 } from 'three';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler, Subscribable } from '../utils';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
export declare const ROTATION_DECREASE_SPEED = 300;
export declare const CAMERA_STEP_SPEED = 20;
export declare const ZERO_POSITION: Vector3;
export declare const ZOOM_STEP_MULTIPLAYER = 1;
export declare const KEY_ROTATION_DECREASE_SPEED = 10;
export declare const BORDER_OPACITY = 100;
export interface ViewControllerEvents {
    'switched:off': void;
    'switched:on': void;
}
export interface ViewController extends Subscribable<ViewControllerEvents> {
    id: string;
    label: string;
    switchOn: () => void;
    switchOff: () => void;
    focusOn: (element: Element) => void;
}
export declare type ViewControllersSet = ((view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler, gamepadHandler: GamepadHandler) => ViewController)[];
