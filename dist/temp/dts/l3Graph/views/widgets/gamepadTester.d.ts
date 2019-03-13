import * as THREE from 'three';
import { GamepadTool } from './gamepadTools/defaultTools';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
import { GraphDescriptor } from '../../models/graph/graphDescriptor';
export declare class GamepadTester<Descriptor extends GraphDescriptor> implements DiagramWidgetView {
    readonly tool: GamepadTool;
    readonly model: GamepadsWidget<Descriptor>;
    readonly mesh: THREE.Group;
    private boundingBox;
    constructor(props: GamepadTool);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
