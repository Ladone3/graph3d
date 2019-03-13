import * as THREE from 'three';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { VrManager } from '../../vrUtils/vrManager';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export interface GamepadsWidgetViewParameters<Descriptor extends GraphDescriptor> {
    model: GamepadsWidget<Descriptor>;
    vrManager: VrManager;
}
export declare class GamepadsWidgetView<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    readonly model: GamepadsWidget<Descriptor>;
    readonly mesh: THREE.Group;
    private vrManager;
    private boundingBox;
    private leftGamepad;
    private rightGamepad;
    constructor(parameters: GamepadsWidgetViewParameters<Descriptor>);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
