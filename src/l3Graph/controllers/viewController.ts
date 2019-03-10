import { DiagramView } from '../views/diagramView';
import { Vector3 } from 'three';

export const ROTATION_DECREASE_SPEED = 300;
export const CAMERA_STEP_SPEED = 20;
export const ZERO_POSITION = new Vector3(0, 0, 0);
export const ZOOM_STEP_MULTIPLAYER = 1;
export const KEY_ROTATION_DECREASE_SPEED = 10;
export const LIMIT_OPACITY = 100;
export const MIN_DRAG_OFFSET = 5;

export interface ViewController {
    id: string;
    label: string;
    onKeyPressed: (event: Set<number>) => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseWheel: (event: MouseWheelEvent) => void;
    refreshCamera: () => void;
    focusOn: (element: Element) => void;
}

export type ViewControllersSet = ((view: DiagramView) => ViewController)[];
