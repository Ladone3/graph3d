import { GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { Element, NodeDefinition } from '../../../models/graph/graphModel';
import { LeftGamepadEditorTool, GamepadEditorToolProps } from './editorTools';
import { EventObject } from '../../../utils';
export interface StateControllerEvents {
    'update': void;
}
export interface EditorState {
    node?: NodeDefinition;
    displayImage?: HTMLImageElement;
}
export interface LeftCreationToolProps extends GamepadEditorToolProps {
    nodeIdPrefix: string;
}
export declare const DISPLAY_TARGET_WIDTH = 0.2;
export declare const DISPLAY_SCALE = 10000;
export declare const MOC_OBJECT_RADIUS = 10;
export declare const MOC_OBJECT_NEAR_MARGIN = 20;
export declare class LeftCreationTool extends LeftGamepadEditorTool {
    protected props: LeftCreationToolProps;
    private node?;
    private rootHtml;
    private container;
    private idCounter;
    constructor(props: LeftCreationToolProps);
    onKeyUp: (e: EventObject<"keyUp", Map<GAMEPAD_BUTTON, Element>>) => void;
    private refreshState;
    private onRefreshDone;
}
