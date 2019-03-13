import * as THREE from 'three';
import { GamepadTool } from './gamepadTools/defaultTools';
import { DiagramWidgetView } from '../viewInterface';
import { GamepadsWidget } from '../../models/widgets/gamepadsWidget';
export declare class GamepadTester implements DiagramWidgetView {
    readonly tool: GamepadTool;
    readonly model: GamepadsWidget;
    readonly mesh: THREE.Group;
    private boundingBox;
    constructor(props: GamepadTool);
    getBoundingBox(): THREE.Box3;
    update(): void;
}
