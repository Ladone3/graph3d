import * as THREE from 'three';

import { vector3DToTreeVector3 } from '../utils';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { ArrowHelper } from '../models/arrowHelper';
import { Element, isLink } from '../models/graphModel';
import { MouseHandler } from '../utils/mouseHandler';

const WHEEL_STEP = 100;

export class MouseEditor {
    private arrowHelper: ArrowHelper;

    constructor(
        private diagramModel: DiagramModel,
        private diagramView: DiagramView,
        private mouseHandler: MouseHandler,
    ) {
        this.arrowHelper = new ArrowHelper();
        this.diagramModel.widgets.registerWidget(this.arrowHelper);

        this.mouseHandler.on('elementClick', e => {
            this.diagramModel.setSelection(new Set([e.data.element]));
            e.data.nativeEvent.preventDefault();
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('paperClick', e => {
            this.diagramModel.setSelection(new Set());
            e.data.preventDefault();
            e.data.stopPropagation();
        });
        this.mouseHandler.on('elementStartDrag', e => {
            this.onElementDrag(e.data.nativeEvent, e.data.element);
            e.data.nativeEvent.preventDefault();
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('elementDrag', e => {
            this.onElementDrag(e.data.nativeEvent, e.data.element);
            e.data.nativeEvent.preventDefault();
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('elementEndDrag', e => {
            this.onElementDragEnd(e.data.nativeEvent, e.data.element);
            e.data.nativeEvent.preventDefault();
            e.data.nativeEvent.stopPropagation();
        });
        this.mouseHandler.on('elementScroll', () => {
            // ...
        });
    }

    onElementDrag(event: MouseEvent | MouseWheelEvent, target: Element) {
        if (isLink(target)) { return; }

        this.arrowHelper.setFocusNode(target);
        const nodeTreePos = vector3DToTreeVector3(target.position);
        const cameraPos = this.diagramView.camera.position;
        let distanceToNode = nodeTreePos.distanceTo(cameraPos);
        if (isMouseWheelEvent(event)) {
            const delata = -(event.deltaX || event.deltaY || event.deltaZ);
            distanceToNode += (delata > 0 ? 1 : -1) * WHEEL_STEP;
        }
        target.setPosition(this.diagramView.mouseTo3dPos(event, distanceToNode));
    }

    onElementDragEnd(event: MouseEvent | MouseWheelEvent, target: Element) {
        this.onElementDrag(event, target);
        this.arrowHelper.setFocusNode(undefined);
    }
}

function isMouseWheelEvent(e: any): e is MouseWheelEvent {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}
