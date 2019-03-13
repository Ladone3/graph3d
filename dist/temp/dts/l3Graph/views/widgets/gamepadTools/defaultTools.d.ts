import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { Subscribable } from '../../../utils';
import { VrManager } from '../../../vrUtils/vrManager';
import { GraphDescriptor } from '../../../models/graph/graphDescriptor';
export interface GamepadToolProps<Descriptor extends GraphDescriptor> {
    gamepadHandler: GamepadHandler<Descriptor>;
    vrManager: VrManager;
}
export interface GamepadToolEvents {
    'update:gamepad': void;
}
export declare abstract class GamepadTool extends Subscribable<GamepadToolEvents> {
    mesh: THREE.Object3D;
    forGamepadId: number;
    constructor();
    protected forceUpdate: () => void;
    abstract onDiscard(): void;
}
export declare class LeftGamepadTool<Descriptor extends GraphDescriptor> extends GamepadTool {
    protected props: GamepadToolProps<Descriptor>;
    protected TARGET_BUTTON: GAMEPAD_BUTTON;
    constructor(props: GamepadToolProps<Descriptor>);
    protected readonly COLOR: string;
    protected registerBearer(): void;
    protected registerHighlighter(): void;
    private renderMesh;
    private updateMesh;
    onDiscard(): void;
}
export declare class RightGamepadTool<Descriptor extends GraphDescriptor> extends LeftGamepadTool<Descriptor> {
    constructor(props: GamepadToolProps<Descriptor>);
    protected TARGET_BUTTON: GAMEPAD_BUTTON;
    protected readonly COLOR: string;
    protected registerBearer(): void;
    protected registerHighlighter(): void;
}
