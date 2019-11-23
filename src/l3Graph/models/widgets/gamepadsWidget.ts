import { Widget } from './widget';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
import { GamepadTool } from '../../views/widgets/gamepadTools/defaultTools';

export interface GamepadsWidgetProps {
    gamepadHandler: GamepadHandler;
    leftTools: GamepadTool[];
    rightTools: GamepadTool[];
}

export interface GamepadsState {
    leftTool: GamepadTool;
    rightTool: GamepadTool;
}

export class GamepadsWidget extends Widget {
    public readonly widgetId: string;
    private _state: GamepadsState;

    constructor(private props: GamepadsWidgetProps) {
        super();
        this.widgetId = 'l3graph-gamepad-widget';

        if (props.leftTools.length === 0 || props.rightTools.length === 0) {
            throw new Error('Left or Right tool is not provided!');
        }

        this._state = {
            leftTool: props.leftTools[0],
            rightTool: props.rightTools[0],
        };
    }

    onRemove() {
        this.props.leftTools.forEach(tool => tool.onDiscard());
        this.props.rightTools.forEach(tool => tool.onDiscard());
    }

    get state(): GamepadsState {
        return this._state;
    }
}
