import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { EventObject } from '../../../utils';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Node } from '../../../models/graph/node';
import { Link } from '../../../models/graph/link';
import { VrManager } from '../../../vrUtils/vrManager';
import { ImageMesh } from './imageMesh';
import { Vector3d } from '../../../models/structures';
export declare const DISPLAY_TARGET_WIDTH = 0.2;
export declare const DISPLAY_OFFSET = -5;
export declare const MOC_OBJECT_RADIUS = 10;
export declare const MOC_OBJECT_NEAR_MARGIN = 20;
export interface GamepadEditorToolProps {
    gamepadHandler: GamepadHandler;
    diagramModel: DiagramModel;
    vrManager: VrManager;
}
export declare class LeftGamepadEditorTool extends GamepadTool {
    protected props: GamepadEditorToolProps;
    protected display: ImageMesh;
    protected mockObject: THREE.Object3D;
    protected readonly BUTTON_CONFIG: {
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
    };
    protected readonly COLOR: string;
    protected readonly ROTATE_Y_ANGLE: number;
    protected readonly gamepad: THREE.Group;
    constructor(props: GamepadEditorToolProps);
    setDisplayImage(displayImage: HTMLImageElement): void;
    getTargetPosition(): Vector3d;
    onDiscard(): void;
    protected render: () => void;
    protected onKeyPressed: (e: EventObject<"keyPressed", Map<GAMEPAD_BUTTON, Link<any> | Node<any>>>) => void;
}
export declare class RightGamepadEditorTool extends LeftGamepadEditorTool {
    constructor(props: GamepadEditorToolProps);
    protected readonly BUTTON_CONFIG: {
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
    };
    protected readonly gamepad: THREE.Group;
    protected readonly COLOR: string;
    protected readonly ROTATE_Y_ANGLE: number;
}
