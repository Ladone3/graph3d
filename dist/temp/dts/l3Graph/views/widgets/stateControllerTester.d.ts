import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { KeyHandler } from '../../utils';
import { Widget } from '../../models/widgets/widget';
export declare const SELECTION_PADDING = 5;
export interface StateTesterViewParameters {
    keyHandler: KeyHandler;
}
export declare class StateTesterModel extends Widget {
    parameters: StateTesterViewParameters;
    constructor(parameters: StateTesterViewParameters);
}
export declare class StateTesterView implements DiagramWidgetView {
    private editorTool;
    mesh: THREE.Object3D;
    model: StateTesterModel;
    constructor({ model }: {
        model: StateTesterModel;
    });
    getBoundingBox(): THREE.Box3;
    update(): void;
}
