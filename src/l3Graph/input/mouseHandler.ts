import * as THREE from 'three';

import { Subscribable } from '../utils/subscribable';
import { GraphDescriptor } from '../models/graph/graphDescriptor';
import { length, eventToPosition, vector3dToTreeVector3 } from '../utils/geometry';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Vector2d, Vector3d } from '../models/structures';
import { Element } from '../models/graph/graphModel';
import { DragHandlerEvents } from './dragHandler';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';

const MIN_DRAG_OFFSET = 5;
const WHEEL_STEP = 100;
const MIN_DISTANCE_TO_CAMERA = 10;

export interface HandlerElementClickEvent {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    element: Element;
}

export interface HandlerDragElementEvent  {
    nativeEvent: MouseEvent | MouseWheelEvent | TouchEvent;
    element: Element;
}

export interface HandlerDragEvent  {
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

export class MouseHandler extends Subscribable<MouseHandlerEvents> {
    private raycaster: THREE.Raycaster;
    private dragging = false;
    private mouseDownOnElement: Element;
    private _hoverTarget: Element | undefined;

    constructor(
        private diagramModel: DiagramModel,
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

    onMouseMoveEvent(event: MouseEvent) {
        const hoverTarget = this.getIntersectedObject(event);
        const prevTarget = this._hoverTarget;
        if (prevTarget) {
            if (hoverTarget) {
                this.trigger('elementHover', {
                    target: hoverTarget,
                    position: hoverTarget instanceof Node ?
                        hoverTarget.position : undefined,
                });
            } else {
                this._hoverTarget = undefined;
                this.trigger('elementHoverEnd', {
                    target: prevTarget,
                    position: prevTarget instanceof Node ?
                        prevTarget.position : undefined,
                });
            }
        } else {
            if (hoverTarget) {
                this._hoverTarget = hoverTarget;
                this.trigger('elementHoverStart', {
                    target: hoverTarget,
                    position: hoverTarget instanceof Node ?
                        hoverTarget.position : undefined,
                });
            }
        }
    }

    onMouseDownEvent(event: MouseEvent | TouchEvent, element?: Element) {
        this.mouseDownOnElement = element || this.getIntersectedObject(event);
        this.dragging = false;

        handleDragging(event, (e, offset) => {
            if (this.dragging) {
                if (this.mouseDownOnElement) {
                    this.trigger('elementDrag', {
                        position: this.getTargetPosition(e, this.mouseDownOnElement),
                        target: this.mouseDownOnElement,
                    });
                } else {
                    this.trigger('paperDrag', {nativeEvent: e, offset});
                }
            } else {
                const dist = length(offset);
                if (dist >= MIN_DRAG_OFFSET) {
                    this.dragging = true;
                    if (this.mouseDownOnElement) {
                        this.trigger('elementDragStart', {
                            position: this.getTargetPosition(e, this.mouseDownOnElement),
                            target: this.mouseDownOnElement,
                        });
                    } else {
                        this.trigger('paperStartDrag', {nativeEvent: e, offset});
                    }
                }
            }
        }, (e, offset) => {
            if (this.dragging) {
                if (this.mouseDownOnElement) {
                    this.trigger('elementDragEnd', {
                        position: this.getTargetPosition(e, this.mouseDownOnElement),
                        target: this.mouseDownOnElement,
                    });
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

    onScrollEvent(event: MouseWheelEvent, element?: Element) {
        event.stopPropagation();
        if (this.mouseDownOnElement) {
            this.dragging = true;
            this.trigger('elementDrag', {
                position: this.getTargetPosition(event, this.mouseDownOnElement),
                target: this.mouseDownOnElement,
            });
        } else {
            if (!element) {
                this.trigger('paperScroll', event);
            }
        }
    }

    private getTargetPosition(event: MouseEvent | TouchEvent, target: Element): Vector3d {
        if (target instanceof Link) { throw new Error('Unsupported target type'); }
        if (event instanceof TouchEvent && event.touches.length === 0) { return target.position; }

        const nodeThreePos = vector3dToTreeVector3(target.position);
        const cameraPos = this.diagramView.camera.position;
        let distanceToNode = nodeThreePos.distanceTo(cameraPos);
        if (isMouseWheelEvent(event)) {
            const delta = -(event.deltaX || event.deltaY || event.deltaZ);
            distanceToNode += (delta > 0 ? 1 : -1) * WHEEL_STEP;
        }
        const size = target.size;
        const minDist = Math.max(size.x, size.y, size.z) / 2 + MIN_DISTANCE_TO_CAMERA;
        const limitedDistance = Math.max(distanceToNode, minDist);
        return this.diagramView.mouseTo3dPos(event, limitedDistance);
    }

    private getIntersectedObject(event: MouseEvent | TouchEvent): Element | undefined {
        const view = this.diagramView;
        const bBox = view.meshHtmlContainer.getBoundingClientRect();
        const position = eventToPosition(event, bBox);
        if (!position) { return undefined; }
        const screenParameters = view.screenParameters;
        const vector = new THREE.Vector3(
            (position.x / screenParameters.WIDTH) * 2 - 1,
            1 - (position.y / screenParameters.HEIGHT) * 2,
            1
        );
        const viewDirection = vector.unproject(view.camera);

        const {meshes, nodeMeshMap} = mapMeshes(this.diagramModel, this.diagramView);

        this.diagramModel.nodes.forEach(node => {
            const nodeView = this.diagramView.graphView.nodeViews.get(node);

            if (nodeView && nodeView.mesh) {
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
        const intersections = this.raycaster.intersectObjects(meshes);

        if (intersections.length > 0) {
            const selectedMesh = intersections[0].object;
            const index = meshes.indexOf(selectedMesh);
            return nodeMeshMap[index];
        } else {
            return undefined;
        }
    }
}

export function mapMeshes(
    diagramModel: DiagramModel, diagramView: DiagramView
)  {
    const meshes: THREE.Object3D[] = [];
    const nodeMeshMap: Element[] = [];
    diagramModel.nodes.forEach(node => {
        const nodeView = diagramView.graphView.nodeViews.get(node);

        if (nodeView && nodeView.mesh) {
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
    return {meshes, nodeMeshMap};
}

export function handleDragging(
    downEvent: MouseEvent | TouchEvent,
    onChange: (event: MouseEvent | TouchEvent, change: Vector2d) => void,
    onEnd?: (event: MouseEvent | TouchEvent, change?: Vector2d) => void,
) {
    const startPoint = eventToPosition(downEvent);
    if (!startPoint) { return; }

    window.getSelection().removeAllRanges();

    const getOffset = (e: MouseEvent | TouchEvent) => {
        const curPoint = eventToPosition(e);
        if (!curPoint) { return undefined; }
        return {
            x: curPoint.x - startPoint.x,
            y: curPoint.y - startPoint.y,
        };
    };

    const _onChange = (e: MouseEvent | TouchEvent) => {
        const offset = getOffset(e);
        if (offset) {
            onChange(e, offset);
        } else {
            _onEnd(e);
        }
    };

    const _onEnd = (e: MouseEvent | TouchEvent) => {
        document.body.removeEventListener('mousemove', _onChange);
        document.body.removeEventListener('touchmove', _onChange);
        document.body.removeEventListener('mouseup', _onEnd);
        document.body.removeEventListener('touchend', _onEnd);
        if (onEnd) { onEnd(e, getOffset(e)); }
    };

    document.body.addEventListener('mousemove', _onChange);
    document.body.addEventListener('touchmove', _onChange);
    document.body.addEventListener('mouseup', _onEnd);
    document.body.addEventListener('touchend', _onEnd);
}

function isMouseWheelEvent(e: any): e is MouseWheelEvent {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}
