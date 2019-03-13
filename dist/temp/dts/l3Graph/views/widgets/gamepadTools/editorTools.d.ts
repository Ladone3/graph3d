import * as THREE from 'three';
import { GamepadHandler, GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { Subscribable } from '../../../utils';
import { GamepadTool } from './defaultTools';
import { DiagramModel } from '../../../models/diagramModel';
import { Element, NodeDefinition } from '../../../models/graph/graphModel';
import { VrManager } from '../../../vrUtils/vrManager';
export interface StateControllerEvents {
    'update': void;
}
export interface EditorState {
    node?: NodeDefinition;
    displayImage?: HTMLImageElement;
}
export declare abstract class StateCore extends Subscribable<StateControllerEvents> {
    abstract input(keyMap: Map<GAMEPAD_BUTTON, Element>): void;
    state: EditorState;
}
export declare const DISPLAY_TARGET_WIDTH = 0.2;
export declare const DISPLAY_SCALE = 10000;
export declare const MOC_OBJECT_RADIUS = 10;
export declare const MOC_OBJECT_NEAR_MARGIN = 20;
export declare class DefaultEditorStateCore extends StateCore {
    private nodeIdPrefix;
    private _state;
    private rootHtml;
    private container;
    private idCounter;
    constructor(nodeIdPrefix: string);
    readonly state: EditorState;
    input(keyMap: Map<GAMEPAD_BUTTON, Element>): void;
    private render;
    private onRenderDone;
}
export interface GamepadEditorToolProps {
    gamepadHandler: GamepadHandler;
    diagramModel: DiagramModel;
    vrManager: VrManager;
    stateCore: StateCore;
}
export declare class LeftGamepadEditorTool extends GamepadTool {
    protected props: GamepadEditorToolProps;
    protected display: THREE.Mesh;
    protected mockObject: THREE.Object3D;
    protected readonly stateController: StateCore;
    protected readonly BUTTON_CONFIG: {
        createButton: GAMEPAD_BUTTON;
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
    };
    protected readonly COLOR: string;
    protected readonly ROTATE_Y_ANGLE: number;
    protected readonly gamepad: THREE.Group;
    constructor(props: GamepadEditorToolProps);
    private render;
    private renderDisplay;
    private onKeyUp;
    private onKeyPressed;
    private setPosition;
    onDiscard(): void;
}
export declare class RightGamepadEditorTool extends LeftGamepadEditorTool {
    constructor(props: GamepadEditorToolProps);
    protected readonly BUTTON_CONFIG: {
        createButton: GAMEPAD_BUTTON;
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
    };
    protected readonly gamepad: THREE.Group;
    protected readonly COLOR: string;
    protected readonly ROTATE_Y_ANGLE: number;
}
