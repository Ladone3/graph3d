import * as THREE from 'three';
import { Subscribable } from './subscribable';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2d } from '../models/structures';
import { Element } from '../models/graph/graphModel';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
export declare const MIN_DRAG_OFFSET = 5;
export interface HandlerElementClickEvent<Descriptor extends GraphDescriptor> {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    element: Element<Descriptor>;
}
export interface HandlerDragElementEvent<Descriptor extends GraphDescriptor> {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    element: Element<Descriptor>;
}
export interface HandlerDragEvent {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    offset: Vector2d;
}
export interface MouseHandlerEvents<Descriptor extends GraphDescriptor> {
    'elementScroll': HandlerElementClickEvent<Descriptor>;
    'paperScroll': MouseWheelEvent;
    'elementClick': HandlerElementClickEvent<Descriptor>;
    'paperClick': MouseEvent | TouchEvent;
    'elementStartDrag': HandlerDragElementEvent<Descriptor>;
    'elementDrag': HandlerDragElementEvent<Descriptor>;
    'elementEndDrag': HandlerDragElementEvent<Descriptor>;
    'paperStartDrag': HandlerDragEvent;
    'paperDrag': HandlerDragEvent;
    'paperEndDrag': HandlerDragEvent;
}
export declare class MouseHandler<Descriptor extends GraphDescriptor> extends Subscribable<MouseHandlerEvents<Descriptor>> {
    private diagramModel;
    private diagramView;
    private raycaster;
    private dragging;
    private mouseDownOnElement;
    constructor(diagramModel: DiagramModel<Descriptor>, diagramView: DiagramView<Descriptor>);
    readonly isPanning: boolean;
    readonly isDragging: boolean;
    readonly draggedElement: Element<Descriptor> | undefined;
    fireMouseDownEvent(event: MouseEvent | TouchEvent, element?: Element<Descriptor>): void;
    fireScrollEvent(event: MouseWheelEvent, element?: Element<Descriptor>): void;
    private getIntersectedObject;
}
export declare function mapMeshes<Descriptor extends GraphDescriptor>(diagramModel: DiagramModel<Descriptor>, diagramView: DiagramView<Descriptor>): {
    meshes: THREE.Object3D[];
    nodeMeshMap: Element<Descriptor>[];
};
export declare function handleDragging(downEvent: MouseEvent | TouchEvent, onChange: (event: MouseEvent | TouchEvent, change: Vector2d) => void, onEnd?: (event: MouseEvent | TouchEvent, change?: Vector2d) => void): void;
