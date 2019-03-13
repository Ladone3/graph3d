import { DiagramView } from '../views/diagramView';
import { Vector3 } from 'three';
export declare const ROTATION_DECREASE_SPEED = 300;
export declare const CAMERA_STEP_SPEED = 20;
export declare const ZERO_POSITION: Vector3;
export declare const ZOOM_STEP_MULTIPLAYER = 1;
export declare const KEY_ROTATION_DECREASE_SPEED = 10;
export declare const LIMIT_OPACITY = 100;
export declare const MIN_DRAG_OFFSET = 5;
export interface ViewController {
    id: string;
    label: string;
    onKeyPressed: (event: Set<number>) => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseWheel: (event: MouseWheelEvent) => void;
    refreshCamera: () => void;
    focusOn: (element: Element) => void;
}
export declare type ViewControllersSet = ((view: DiagramView) => ViewController)[];
