import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { VrManager } from '../../vrUtils/vrManager';
export interface GamepadsWidgetViewParameters {
    model: GamepadsWidget;
    vrManager: VrManager;
}
export declare class GamepadsWidgetView implements DiagramWidgetView {
    readonly model: GamepadsWidget;
    readonly mesh: THREE.Group;
    private vrManager;
    private boundingBox;
    private leftGamepad;
    private rightGamepad;
    constructor(parameters: GamepadsWidgetViewParameters);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
