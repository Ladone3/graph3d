import { Widget } from './widget';
import { GamepadHandler } from '../../input/gamepadHandler';
import { GamepadTool } from '../../views/widgets/gamepadTools/defaultTools';
export interface GamepadsWidgetProps {
    gamepadHandler: GamepadHandler;
    leftTool?: GamepadTool;
    rightTool?: GamepadTool;
}
export declare class GamepadsWidget extends Widget {
    props: GamepadsWidgetProps;
    readonly widgetId: string;
    constructor(props: GamepadsWidgetProps);
    onRemove(): void;
}
