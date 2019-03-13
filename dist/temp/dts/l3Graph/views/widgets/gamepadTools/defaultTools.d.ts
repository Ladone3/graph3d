import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { Subscribable } from '../../../utils';
import { VrManager } from '../../../vrUtils/vrManager';
export interface GamepadToolProps {
    gamepadHandler: GamepadHandler;
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
export declare class LeftGamepadTool extends GamepadTool {
    protected props: GamepadToolProps;
    protected TARGET_BUTTON: GAMEPAD_BUTTON;
    constructor(props: GamepadToolProps);
    protected readonly COLOR: string;
    protected registerBearer(): void;
    protected registerHighlighter(): void;
    private renderMesh;
    private updateMesh;
    onDiscard(): void;
}
export declare class RightGamepadTool extends LeftGamepadTool {
    constructor(props: GamepadToolProps);
    protected TARGET_BUTTON: GAMEPAD_BUTTON;
    protected readonly COLOR: string;
    protected registerBearer(): void;
    protected registerHighlighter(): void;
}
