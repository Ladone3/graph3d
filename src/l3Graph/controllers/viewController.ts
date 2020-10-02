import { DiagramView } from '../views/diagramView';
import { Vector3 } from 'three';
import { MouseHandler } from '../input/mouseHandler';
import { KeyHandler } from '../input/keyHandler';
import { Subscribable } from '../utils';
import { GamepadHandler } from '../input/gamepadHandler';

export const ROTATION_DECREASE_SPEED = 300;
export const CAMERA_STEP_SPEED = 20;
export const ZERO_POSITION = new Vector3(0, 0, 0);
export const ZOOM_STEP_MULTIPLAYER = 1;
export const KEY_ROTATION_DECREASE_SPEED = 10;
export const BORDER_OPACITY = 100;

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

export type ViewControllersSet = (
    (
        view: DiagramView,
        mouseHandler: MouseHandler,
        keyHandler: KeyHandler,
        gamepadHandler: GamepadHandler
    ) => ViewController
)[];
