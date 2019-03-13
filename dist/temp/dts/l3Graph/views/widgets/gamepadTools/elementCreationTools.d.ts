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
export declare class LeftCreationTool extends LeftGamepadEditorTool {
    protected props: LeftCreationToolProps;
    private node?;
    private rootHtml;
    private container;
    private idCounter;
    constructor(props: LeftCreationToolProps);
    protected readonly BUTTON_CONFIG: {
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
        createButton: GAMEPAD_BUTTON;
    };
    protected onKeyUp: (e: EventObject<"keyUp", Map<GAMEPAD_BUTTON, Element>>) => void;
    private refreshState;
    private onRefreshDone;
}
