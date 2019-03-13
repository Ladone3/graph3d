import { Widget } from './widget';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
import { GamepadTool } from '../../views/widgets/gamepadTools/defaultTools';
import { GraphDescriptor } from '../graph/graphDescriptor';
export interface GamepadsWidgetProps<Descriptor extends GraphDescriptor> {
    gamepadHandler: GamepadHandler<Descriptor>;
    leftTools: GamepadTool[];
    rightTools: GamepadTool[];
}
export interface GamepadsTools {
    leftTool: GamepadTool;
    rightTool: GamepadTool;
}
export declare class GamepadsWidget<Descriptor extends GraphDescriptor> extends Widget {
    private props;
    readonly widgetId: string;
    private _tools;
    constructor(props: GamepadsWidgetProps<Descriptor>);
    onRemove(): void;
    readonly tools: GamepadsTools;
}
