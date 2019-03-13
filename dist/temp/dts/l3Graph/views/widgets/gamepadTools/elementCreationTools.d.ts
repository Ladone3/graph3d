import { GAMEPAD_BUTTON } from '../../../vrUtils/gamepadHandler';
import { Element } from '../../../models/graph/graphModel';
import { LeftGamepadEditorTool, GamepadEditorToolProps } from './editorTools';
import { EventObject } from '../../../utils';
import { GraphDescriptor } from '../../../models/graph/graphDescriptor';
export interface StateControllerEvents {
    'update': void;
}
export interface LeftCreationToolProps<Descriptor extends GraphDescriptor> extends GamepadEditorToolProps<Descriptor> {
    nodeIdPrefix: string;
}
export declare class LeftCreationTool<Descriptor extends GraphDescriptor> extends LeftGamepadEditorTool<Descriptor> {
    protected props: LeftCreationToolProps<Descriptor>;
    private node?;
    private rootHtml;
    private container;
    private idCounter;
    constructor(props: LeftCreationToolProps<Descriptor>);
    protected readonly BUTTON_CONFIG: {
        pushMock: GAMEPAD_BUTTON;
        pullMock: GAMEPAD_BUTTON;
        createButton: GAMEPAD_BUTTON;
    };
    protected onKeyUp: (e: EventObject<"keyUp", Map<GAMEPAD_BUTTON, Element<Descriptor>>>) => void;
    private refreshState;
    private onRefreshDone;
}
