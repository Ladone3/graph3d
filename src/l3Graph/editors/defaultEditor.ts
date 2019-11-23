import { vector3dToTreeVector3, KeyHandler, KEY_CODES } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Element } from '../models/graph/graphModel';
import { MouseHandler } from '../utils/mouseHandler';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';

const WHEEL_STEP = 100;
const MIN_DISTANCE_TO_CAMERA = 10;

export class DefaultEditor {
    constructor(
        private diagramModel: DiagramModel,
        private diagramView: DiagramView,
        private mouseHandler: MouseHandler,
        private keyHandler: KeyHandler,
        // private gamepadHandler: GamepadHandler
    ) {
        this.mouseHandler.on('elementClick', e => {
            if (!this.diagramModel.selection.elements.has(e.data.element)) {
                this.diagramModel.selection.setSelection(new Set([e.data.element]));
            }
        });
        this.mouseHandler.on('paperClick', e => {
            this.diagramModel.selection.setSelection(new Set());
        });
        this.mouseHandler.on('elementStartDrag', e => {
            this.onElementDrag(e.data.nativeEvent, e.data.element);
        });
        this.mouseHandler.on('elementDrag', e => {
            this.onElementDrag(e.data.nativeEvent, e.data.element);
        });
        this.mouseHandler.on('elementEndDrag', e => {
            this.onElementDragEnd(e.data.nativeEvent, e.data.element);
        });

        this.keyHandler.on('keyPressed', e => this.onKeyPressed(e.data));
    }

    private onKeyPressed(keyMap: Set<number>) {
        if (keyMap.has(KEY_CODES.DELETE) && this.diagramModel.selection.elements.size > 0) {
            const nodesToDelete: Node[] = [];
            const linksToDelete: Link[] = [];
            this.diagramModel.selection.elements.forEach(el => {
                if (el instanceof Node) {
                    nodesToDelete.push(el);
                } else {
                    linksToDelete.push(el);
                }
            });
            this.diagramModel.graph.removeLinks(linksToDelete);
            this.diagramModel.graph.removeNodes(nodesToDelete);
        }
    }

    private onElementDrag(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element) {
        if (target instanceof Link) { return; }
        if (event instanceof TouchEvent && event.touches.length === 0) { return; }

        const nodeThreePos = vector3dToTreeVector3(target.position);
        const cameraPos = this.diagramView.camera.position;
        let distanceToNode = nodeThreePos.distanceTo(cameraPos);
        if (isMouseWheelEvent(event)) {
            const delata = -(event.deltaX || event.deltaY || event.deltaZ);
            distanceToNode += (delata > 0 ? 1 : -1) * WHEEL_STEP;
        }
        const size = target.size;
        const minDist = Math.max(size.x, size.y, size.z) / 2 + MIN_DISTANCE_TO_CAMERA;
        const limitedDistance = Math.max(distanceToNode, minDist);
        const newNodePosition = this.diagramView.mouseTo3dPos(event, limitedDistance);
        target.setPosition(newNodePosition);
    }

    private onElementDragEnd(event: MouseEvent | TouchEvent | MouseWheelEvent, target: Element) {
        this.onElementDrag(event, target);
    }
}

function isMouseWheelEvent(e: any): e is MouseWheelEvent {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}
