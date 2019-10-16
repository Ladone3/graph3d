import * as THREE from 'three';

import { Subscribable } from './subscribeable';
import { handleDragging, length } from './geometry';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2D } from '../models/structures';
import { Element } from '../models/graph/graphModel';
export const MIN_DRAG_OFFSET = 5;

export interface HandlerElementClickEvent {
    nativeEvent: MouseEvent | MouseWheelEvent;
    element: Element;
}

export interface HandlerDragElementEvent  {
    nativeEvent: MouseEvent | MouseWheelEvent;
    element: Element;
}

export interface HandlerDragEvent  {
    nativeEvent: MouseEvent | MouseWheelEvent;
    offset: Vector2D;
}

export interface MouseHandlerEvents {
    'elementScroll': HandlerElementClickEvent;
    'paperScroll': MouseWheelEvent;

    'elementClick': HandlerElementClickEvent;
    'paperClick': MouseEvent;

    'elementStartDrag': HandlerDragElementEvent;
    'elementDrag': HandlerDragElementEvent;
    'elementEndDrag': HandlerDragElementEvent;

    'paperStartDrag': HandlerDragEvent;
    'paperDrag': HandlerDragEvent;
    'paperEndDrag': HandlerDragEvent;
}

export class MouseHandler extends Subscribable<MouseHandlerEvents> {
    private raycaster: THREE.Raycaster;
    private dragging = false;
    private mouseDownOnElement: Element;

    constructor(
        private diagramhModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        super();
        this.raycaster = new THREE.Raycaster();
    }

    get isPanning() {
        return this.dragging && !this.mouseDownOnElement;
    }

    get isDragging() {
        return this.dragging && Boolean(this.mouseDownOnElement);
    }

    get draggedElement(): Element | undefined {
        if (this.isDragging) {
            return this.mouseDownOnElement;
        } else {
            return undefined;
        }
    }

    onMouseDown(event: MouseEvent, element?: Element) {
        this.mouseDownOnElement = element || this.getIntersectedObject(event);
        this.dragging = false;

        handleDragging(event, (e, offset) => {
            if (this.dragging) {
                if (this.mouseDownOnElement) {
                    this.trigger('elementDrag', {nativeEvent: e, element: this.mouseDownOnElement});
                } else {
                    this.trigger('paperDrag', {nativeEvent: e, offset});
                }
            } else {
                const dist = length(offset);
                if (dist >= MIN_DRAG_OFFSET) {
                    this.dragging = true;
                    if (this.mouseDownOnElement) {
                        this.trigger('elementStartDrag', {nativeEvent: e, element: this.mouseDownOnElement});
                    } else {
                        this.trigger('paperStartDrag', {nativeEvent: e, offset});
                    }
                }
            }
        }, (e, offset) => {
            if (this.dragging) {
                if (this.mouseDownOnElement) {
                    this.trigger('elementEndDrag', {nativeEvent: e, element: this.mouseDownOnElement});
                } else {
                    this.trigger('paperEndDrag', {nativeEvent: e, offset});
                }
            } else {
                if (this.mouseDownOnElement) {
                    this.trigger('elementClick', {nativeEvent: e, element: this.mouseDownOnElement});
                } else {
                    this.trigger('paperClick', e);
                }
            }
            this.dragging = false;
            this.mouseDownOnElement = undefined;
        });
    }

    onScroll(event: MouseWheelEvent, element?: Element) {
        event.stopPropagation();
        if (this.mouseDownOnElement) {
            this.dragging = true;
            this.trigger('elementDrag', {nativeEvent: event, element: this.mouseDownOnElement});
        } else {
            if (element) {
                this.trigger('elementScroll', {nativeEvent: event, element});
            } else {
                this.trigger('paperScroll', event);
            }
        }
    }

    private getIntersectedObject(event: MouseEvent): Element | undefined {
        const view = this.diagramView;
        const bbox = view.meshHtmlContainer.getBoundingClientRect();
        const position: Vector2D = {
            x: event.clientX - bbox.left,
            y: event.clientY - bbox.top,
        };
        const screenParameters = view.screenParameters;
        const vector = new THREE.Vector3(
            (position.x / screenParameters.WIDTH) * 2 - 1,
            1 - (position.y / screenParameters.HEIGHT) * 2,
            1
        );
        const viewDirection = vector.unproject(view.camera);

        const meshes: THREE.Object3D[] = [];
        const nodeMeshMap: Element[] = [];

        this.diagramhModel.nodes.forEach(node => {
            const nodeView = this.diagramView.graphView.views.get(node.id);

            if (nodeView.mesh) {
                if (nodeView.mesh instanceof THREE.Group) {
                    for (const obj of nodeView.mesh.children) {
                        meshes.push(obj);
                        nodeMeshMap.push(node);
                    }
                } else {
                    meshes.push(nodeView.mesh);
                    nodeMeshMap.push(node);
                }
            }
        });

        this.raycaster.set(
            this.diagramView.camera.position,
            viewDirection.sub(this.diagramView.camera.position).normalize()
        );
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const index = meshes.indexOf(selectedMesh);
            return nodeMeshMap[index];
        } else {
            return undefined;
        }
    }
}
