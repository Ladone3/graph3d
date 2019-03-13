import * as THREE from 'three';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
export declare class MouseEditor {
    private diagramhModel;
    private diagramView;
    private raycaster;
    private arrowHelper;
    constructor(diagramhModel: DiagramModel, diagramView: DiagramView);
    onMouseDown(event: MouseEvent): boolean;
    private getIntersectedObject(viewDirection);
    calcRay(event: MouseEvent): THREE.Vector3;
}
