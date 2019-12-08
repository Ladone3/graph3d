import { Widget } from './widget';
import { GamepadHandler, OCULUS_CONTROLLERS } from '../../vrUtils/gamepadHandler';
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

export class GamepadsWidget extends Widget {
    public readonly widgetId: string;
    private _tools: GamepadsTools;

    constructor(private props: GamepadsWidgetProps) {
        super();
        this.widgetId = 'l3graph-gamepad-widget';

        if (props.leftTools.length === 0 || props.rightTools.length === 0) {
            throw new Error('Left or Right tool is not provided!');
        }

        this._tools = {
            leftTool: props.leftTools[0],
            rightTool: props.rightTools[0],
        };
    }

    onRemove() {
        this.props.leftTools.forEach(tool => tool.onDiscard());
        this.props.rightTools.forEach(tool => tool.onDiscard());
    }

    get tools(): GamepadsTools {
        if (
            this._tools.leftTool.forGamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER &&
            this._tools.rightTool.forGamepadId === OCULUS_CONTROLLERS.RIGHT_CONTROLLER
        ) {
            return this._tools;
        } else if (
            this._tools.leftTool.forGamepadId === OCULUS_CONTROLLERS.RIGHT_CONTROLLER &&
            this._tools.rightTool.forGamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER
        ) {
            console.warn('Please change configuration left gamepad and right one are mixed up!');
            return {
                leftTool: this._tools.rightTool,
                rightTool: this._tools.leftTool,
            }
        } else {
            console.warn('Wrong gamepad tool configuration!');
            return this._tools;
        }
    }
}
