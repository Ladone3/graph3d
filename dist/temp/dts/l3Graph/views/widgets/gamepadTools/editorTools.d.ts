import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { EventObject } from '../../../utils';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Element } from '../../../models/graph/graphModel';
import { VrManager } from '../../../vrUtils/vrManager';
import { ImageMesh } from './imageMesh';
import { Vector3d } from '../../../models/structures';
import { GraphDescriptor } from '../../../models/graph/graphDescriptor';
export declare const DISPLAY_TARGET_WIDTH = 0.2;
export declare const DISPLAY_OFFSET = -5;
export declare const MOC_OBJECT_RADIUS = 10;
export declare const MOC_OBJECT_NEAR_MARGIN = 20;
export interface GamepadEditorToolProps<Descriptor extends GraphDescriptor> {
    gamepadHandler: GamepadHandler<Descriptor>;
    diagramModel: DiagramModel<Descriptor>;
    vrManager: VrManager<Descriptor>;
}
export declare class LeftGamepadEditorTool<Descriptor extends GraphDescriptor> extends GamepadTool {
    protected props: GamepadEditorToolProps<Descriptor>;
    protected display: ImageMesh;
    protected mockObject: THREE.Object3D;
    protected readonly BUTTON_CONFIG: {
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
    };
    protected readonly COLOR: string;
    protected readonly ROTATE_Y_ANGLE: number;
    protected readonly gamepad: THREE.Group;
    constructor(props: GamepadEditorToolProps<Descriptor>);
    setDisplayImage(displayImage: HTMLImageElement): void;
    getTargetPosition(): Vector3d;
    onDiscard(): void;
    protected render: () => void;
    protected onKeyPressed: (e: EventObject<"keyPressed", Map<GAMEPAD_BUTTON, Element<Descriptor>>>) => void;
}
export declare class RightGamepadEditorTool<Descriptor extends GraphDescriptor> extends LeftGamepadEditorTool<Descriptor> {
    constructor(props: GamepadEditorToolProps<Descriptor>);
    protected readonly BUTTON_CONFIG: {
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
    };
    protected readonly gamepad: THREE.Group;
    protected readonly COLOR: string;
    protected readonly ROTATE_Y_ANGLE: number;
}
