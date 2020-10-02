import { Widget } from './widget';
import { GamepadHandler, OCULUS_CONTROLLERS } from '../../input/gamepadHandler';
import { GamepadTool } from '../../views/widgets/gamepadTools/defaultTools';

export interface GamepadsWidgetProps {
    gamepadHandler: GamepadHandler;
    leftTool?: GamepadTool;
    rightTool?: GamepadTool;
}

export class GamepadsWidget extends Widget {
    public readonly widgetId: string;

    constructor(public props: GamepadsWidgetProps) {
        super();
        this.widgetId = 'l3graph-gamepad-widget';
    }

    onRemove() {
        if (this.props.leftTool) {
            this.props.leftTool.discard();
        }
        if (this.props.rightTool) {
            this.props.rightTool.discard();
        }
    }
}
