import { Widget } from './widget';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
import { GamepadTool } from '../../views/widgets/gamepadTools/defaultTools';
export interface GamepadsWidgetProps {
    gamepadHandler: GamepadHandler;
    leftTools: GamepadTool[];
    rightTools: GamepadTool[];
}
export interface GamepadsTools {
    leftTool: GamepadTool;
    rightTool: GamepadTool;
}
export declare class GamepadsWidget extends Widget {
    private props;
    readonly widgetId: string;
    private _tools;
    constructor(props: GamepadsWidgetProps);
    onRemove(): void;
    readonly tools: GamepadsTools;
}
