import { Widget } from './widget';
import { GamepadHandler, GAMEPAD_BUTTONS, OCULUS_CONTROLLERS } from '../../vrUtils/gamepadHandler';

export interface GamepadsWidgetParameters {
    gamepadHandler: GamepadHandler;
}

export interface GamepadsState {
	leftGamepad: {
        id: number;
        triggerPressed: boolean;
    },
    rightGamepad: {
        id: number;
        triggerPressed: boolean
    },
    gpNumber: number;
}

export class GamepadsWidget extends Widget {
    public readonly widgetId: string;
    private gamepadHandler: GamepadHandler;

    constructor(parameters: GamepadsWidgetParameters) {
        super();
        this.widgetId = 'l3graph-gamepad-widget';
        this.gamepadHandler = parameters.gamepadHandler;
        this.gamepadHandler.on('keyDown', this.forceUpdate);
        this.gamepadHandler.on('keyUp', this.forceUpdate);
    }

    onRemove() {
        this.gamepadHandler.unsubscribe(this.forceUpdate);
        this.gamepadHandler.unsubscribe(this.forceUpdate);
    }

    get state(): GamepadsState {
        const gpNumber = this.gamepadHandler.activeGamepadNumber;
        return {
            gpNumber,
            leftGamepad: gpNumber > 0 ? {
                id: OCULUS_CONTROLLERS.LEFT_CONTROLLER,
                triggerPressed: this.gamepadHandler.keyPressed.has(GAMEPAD_BUTTONS.LEFT_TRIGGER)
            } : undefined,
            rightGamepad: gpNumber > 1 ? {
                id: OCULUS_CONTROLLERS.RIGHT_CONTROLLER,
                triggerPressed: this.gamepadHandler.keyPressed.has(GAMEPAD_BUTTONS.RIGHT_TRIGGER)
            } : undefined,
        };
    }
}
