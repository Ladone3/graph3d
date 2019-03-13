import { Widget } from './widget';
import { GamepadHandler } from '../../vrUtils/gamepadHandler';
export interface GamepadsWidgetParameters {
    gamepadHandler: GamepadHandler;
}
export interface GamepadsState {
    leftGamepad: {
        id: number;
        triggerPressed: boolean;
    };
    rightGamepad: {
        id: number;
        triggerPressed: boolean;
    };
    gpNumber: number;
}
export declare class GamepadsWidget extends Widget {
    readonly widgetId: string;
    private gamepadHandler;
    constructor(parameters: GamepadsWidgetParameters);
    onRemove(): void;
    readonly state: GamepadsState;
}
