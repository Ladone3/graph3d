import * as THREE from 'three';
import { Subscribable } from './subscribable';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2d } from '../models/structures';
import { Element } from '../models/graph/graphModel';
export declare const MIN_DRAG_OFFSET = 5;
export interface HandlerElementClickEvent {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    element: Element;
}
export interface HandlerDragElementEvent {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    element: Element;
}
export interface HandlerDragEvent {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    offset: Vector2d;
}
export interface MouseHandlerEvents {
    'elementScroll': HandlerElementClickEvent;
    'paperScroll': MouseWheelEvent;
    'elementClick': HandlerElementClickEvent;
    'paperClick': MouseEvent | TouchEvent;
    'elementStartDrag': HandlerDragElementEvent;
    'elementDrag': HandlerDragElementEvent;
    'elementEndDrag': HandlerDragElementEvent;
    'paperStartDrag': HandlerDragEvent;
    'paperDrag': HandlerDragEvent;
    'paperEndDrag': HandlerDragEvent;
}
export declare class MouseHandler extends Subscribable<MouseHandlerEvents> {
    private diagramModel;
    private diagramView;
    private raycaster;
    private dragging;
    private mouseDownOnElement;
    constructor(diagramModel: DiagramModel, diagramView: DiagramView);
    readonly isPanning: boolean;
    readonly isDragging: boolean;
    readonly draggedElement: Element | undefined;
    fireMouseDownEvent(event: MouseEvent | TouchEvent, element?: Element): void;
    fireScrollEvent(event: MouseWheelEvent, element?: Element): void;
    private getIntersectedObject;
}
export declare function mapMeshes(diagramModel: DiagramModel, diagramView: DiagramView): {
    meshes: THREE.Object3D[];
    nodeMeshMap: (import("../..").Link<any> | import("../..").Node<any>)[];
};
export declare function handleDragging(downEvent: MouseEvent | TouchEvent, onChange: (event: MouseEvent | TouchEvent, change: Vector2d) => void, onEnd?: (event: MouseEvent | TouchEvent, change?: Vector2d) => void): void;
