import * as THREE from 'three';

import { Subscribable } from './subscribeable';
import { handleDragging, length } from './geometry';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2D } from '../models/primitives';
import { Element } from '../models/graphModel';
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
    private isDrugging = false;
    private mouseDownElement: Element;

    constructor(
        private diagramhModel: DiagramModel,
        private diagramView: DiagramView,
    ) {
        super();
        this.raycaster = new THREE.Raycaster();
    }

    onMouseDown(event: MouseEvent, element?: Element) {
        this.mouseDownElement = element || this.getIntersectedObject(event);
        this.isDrugging = false;

        handleDragging(event, (e, offset) => {
            if (this.isDrugging) {
                if (this.mouseDownElement) {
                    this.trigger('elementDrag', {nativeEvent: e, element: this.mouseDownElement});
                } else {
                    this.trigger('paperDrag', {nativeEvent: e, offset});
                }
            } else {
                const dist = length(offset);
                if (dist >= MIN_DRAG_OFFSET) {
                    this.isDrugging = true;
                    if (this.mouseDownElement) {
                        this.trigger('elementStartDrag', {nativeEvent: e, element: this.mouseDownElement});
                    } else {
                        this.trigger('paperStartDrag', {nativeEvent: e, offset});
                    }
                }
            }
        }, (e, offset) => {
            if (this.isDrugging) {
                if (this.mouseDownElement) {
                    this.trigger('elementEndDrag', {nativeEvent: e, element: this.mouseDownElement});
                } else {
                    this.trigger('paperEndDrag', {nativeEvent: e, offset});
                }
            } else {
                if (this.mouseDownElement) {
                    this.trigger('elementClick', {nativeEvent: e, element: this.mouseDownElement});
                } else {
                    this.trigger('paperClick', e);
                }
            }
            this.isDrugging = false;
            this.mouseDownElement = undefined;
        });
    }

    onScroll(event: MouseWheelEvent, element?: Element) {
        if (this.mouseDownElement) {
            this.isDrugging = true;
            this.trigger('elementDrag', {nativeEvent: event, element: this.mouseDownElement});
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
            if (nodeView.overlay) {
                meshes.push(nodeView.overlay);
                nodeMeshMap.push(node);
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
