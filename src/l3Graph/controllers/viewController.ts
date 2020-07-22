import { DiagramView } from '../views/diagramView';
import { Vector3 } from 'three';
import { MouseHandler } from '../utils/mouseHandler';
import { KeyHandler, Subscribable } from '../utils';
import { VrManager } from '../vrUtils/vrManager';
import { GamepadHandler } from '../vrUtils/gamepadHandler';
import { GraphDescriptor } from '../models/graph/graphDescriptor';

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

export type ViewControllersSet<Descriptor extends GraphDescriptor> = (
    (
        view: DiagramView<Descriptor>,
        mouseHandler: MouseHandler<Descriptor>,
        keyHandler: KeyHandler,
        gamepadHandler: GamepadHandler<Descriptor>
    ) => ViewController
)[];
