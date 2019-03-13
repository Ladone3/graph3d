import { Vector3d } from '../models/structures';
import { Element } from '../models/graph/graphModel';
export interface DragEventData {
    target: Element;
    position: Vector3d;
}
export interface DragHandlerEvents {
    'elementHoverStart': DragEventData;
    'elementHover': DragEventData;
    'elementHoverEnd': DragEventData;
    'elementDragStart': DragEventData;
    'elementDrag': DragEventData;
    'elementDragEnd': DragEventData;
}
