import { Subscribable } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { Element } from '../models/graph/graphModel';
import { MouseHandler } from '../input/mouseHandler';
import { KeyHandler, KEY_CODES } from '../input/keyHandler';
import { Link } from '../models/graph/link';
import { Node } from '../models/graph/node';
import { Vector3d } from '../models/structures';
import { GamepadHandler } from '../input/gamepadHandler';
import { DragHandlerEvents } from '../input/dragHandler';

export class DefaultEditor {
    constructor(
        private diagramModel: DiagramModel,
        private mouseHandler: MouseHandler,
        private keyHandler: KeyHandler,
        gamepadHandler: GamepadHandler
    ) {
        this.mouseHandler.on('elementClick', e => {
            if (e.data.element instanceof Node && !this.diagramModel.selection.elements.has(e.data.element)) {
                this.diagramModel.selection.setSelection(new Set([e.data.element]));
            }
        });
        this.mouseHandler.on('paperClick', e => {
            this.diagramModel.selection.setSelection(new Set());
        });
        this.keyHandler.on('keyPressed', e => this.onKeyPressed(e.data));
        this.subscribeOnDragHandler(mouseHandler as any);
        this.subscribeOnDragHandler(gamepadHandler as any);
    }

    private subscribeOnDragHandler(
        dragHandler: Subscribable<DragHandlerEvents>
    ) {
        dragHandler.on('elementDragStart', e => {
            this.onElementDrag(e.data.target, e.data.position);
        });
        dragHandler.on('elementDrag', e => {
            this.onElementDrag(e.data.target, e.data.position);
        });
        dragHandler.on('elementDragEnd', e => {
            this.onElementDragEnd(e.data.target, e.data.position);
        });
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

    private onElementDrag(target: Element, position: Vector3d) {
        if (target instanceof Link) { return; }
        if (!position) { throw new Error('Position can\'t be undefined!'); }
        target.setPosition(position);
    }

    private onElementDragEnd(target: Element, position: Vector3d) {
        this.onElementDrag(target, position);
    }
}
