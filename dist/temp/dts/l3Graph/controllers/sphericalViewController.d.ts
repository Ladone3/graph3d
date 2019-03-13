import { Vector2d } from '../models/structures';
import { ViewController, ViewControllerEvents } from './viewController';
import { KeyHandler, Subscribable } from '../utils';
import { DiagramView } from '../views/diagramView';
import { MouseHandler } from '../utils/mouseHandler';
export declare class SphericalViewController extends Subscribable<ViewControllerEvents> implements ViewController {
    protected view: DiagramView;
    protected mouseHandler: MouseHandler;
    protected keyHandler: KeyHandler;
    readonly id: string;
    label: string;
    protected cameraAngle: Vector2d;
    protected cameraDistance: number;
    protected startAngle: Vector2d;
    constructor(view: DiagramView, mouseHandler: MouseHandler, keyHandler: KeyHandler);
    switchOn(): void;
    switchOff(): void;
    private refreshCamera;
    focusOn(element: Element): void;
    protected setCameraAngle(anglePoint: Vector2d): void;
    protected setCameraDistance(distance: number): void;
    protected updateCameraPosition(): void;
    protected limitDistance(distance: number): number;
    private onMouseDragStart;
    private onMouseDrag;
    private onMouseWheel;
    private onKeyPressed;
    private zoom;
}