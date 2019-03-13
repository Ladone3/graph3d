import * as THREE from 'three';
import { Subscribable } from '../utils/subscribable';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2d } from '../models/structures';
import { Element } from '../models/graph/graphModel';
import { DragHandlerEvents } from './dragHandler';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
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
export interface MouseHandlerEvents extends DragHandlerEvents {
    'paperScroll': MouseWheelEvent;
    'elementClick': HandlerElementClickEvent;
    'paperClick': MouseEvent | TouchEvent;
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
    private _hoverTarget;
    constructor(diagramModel: DiagramModel, diagramView: DiagramView);
    readonly isPanning: boolean;
    readonly isDragging: boolean;
    readonly draggedElement: Element | undefined;
    onMouseMoveEvent(event: MouseEvent): void;
    onMouseDownEvent(event: MouseEvent | TouchEvent, element?: Element): void;
    onScrollEvent(event: MouseWheelEvent, element?: Element): void;
    private getTargetPosition;
    private getIntersectedObject;
}
export declare function mapMeshes(diagramModel: DiagramModel, diagramView: DiagramView): {
    meshes: THREE.Object3D[];
    nodeMeshMap: (Link<GraphDescriptor<unknown, unknown>> | Node<GraphDescriptor<unknown, unknown>>)[];
};
export declare function handleDragging(downEvent: MouseEvent | TouchEvent, onChange: (event: MouseEvent | TouchEvent, change: Vector2d) => void, onEnd?: (event: MouseEvent | TouchEvent, change?: Vector2d) => void): void;
