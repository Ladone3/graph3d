import * as THREE from 'three';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
import { Element } from '../models/graphModel';
export declare class MouseEditor {
    private diagramhModel;
    private diagramView;
    private raycaster;
    private arrowHelper;
    constructor(diagramhModel: DiagramModel, diagramView: DiagramView);
    onMouseDown(event: MouseEvent): boolean;
    onOverlayDown(event: MouseEvent, target: Element): void;
    private getIntersectedObject(viewDirection);
    calcRay(event: MouseEvent): THREE.Vector3;
}
