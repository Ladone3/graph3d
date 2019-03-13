import { Vector2D, Vector3D } from '../models/primitives';
import { ViewController } from './viewController';
import { DiagramView } from '../views/diagramView';
export declare class OpenSpaceViewController implements ViewController {
    readonly id: string;
    label: string;
    protected view: DiagramView;
    protected cameraAngle: Vector2D;
    protected position: Vector3D;
    constructor(view: DiagramView);
    onMouseDown(event: MouseEvent): void;
    protected setCameraDirection(anglePoint: Vector2D): void;
    onKeyPressed(keyMap: Set<number>): void;
    onMouseWheel(event: MouseWheelEvent): void;
    private stepLeft();
    private stepRight();
    private stepUp();
    private stepDown();
    private stepForward();
    private stepBack();
    focusOn(element: Element): void;
    refreshCamera(): void;
    private getCameraDirection();
    protected updateCameraPosition(): void;
    protected limitPosition(targetPosition: Vector3D): Vector3D;
}
