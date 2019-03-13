import { Vector2D } from '../models/primitives';
import { ViewController } from './viewController';
import { DiagramView } from '../views/diagramView';
export declare class SphericalViewController implements ViewController {
    readonly id: string;
    label: string;
    protected view: DiagramView;
    protected cameraAngle: Vector2D;
    protected cameraDistance: number;
    constructor(view: DiagramView);
    onMouseDown(event: MouseEvent): void;
    onKeyPressed(keyMap: Set<number>): void;
    onMouseWheel(event: MouseWheelEvent): void;
    zoom(diff: number): void;
    refreshCamera(): void;
    focusOn(element: Element): void;
    protected setCameraAngle(anglePoint: Vector2D): void;
    protected setCameraDistance(distance: number): void;
    protected updateCameraPosition(): void;
    protected limitDistance(distance: number): number;
}
