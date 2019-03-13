import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../input/gamepadHandler';
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
    constructor();
    protected forceUpdate: () => void;
    abstract discard(): void;
}
export declare class LeftGamepadTool extends GamepadTool {
    protected props: GamepadToolProps;
    constructor(props: GamepadToolProps);
    protected readonly controller: THREE.Group;
    protected readonly COLOR: string;
    private renderMesh;
    private updateMesh;
    discard(): void;
}
export declare class RightGamepadTool extends LeftGamepadTool {
    constructor(props: GamepadToolProps);
    protected TARGET_BUTTON: GAMEPAD_BUTTON;
    protected readonly COLOR: string;
    protected readonly controller: THREE.Group;
}
