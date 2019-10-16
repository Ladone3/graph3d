import { MouseHandler } from '../../utils/mouseHandler';
import { Widget } from './widget';
import { ThreejsVrManager, VrGamepad } from '../../vrUtils/webVr';

export interface GamepadsWidgetParameters {
    mouseHandler: MouseHandler;
}

export const GAMEPADS_NUMBER = 2;

export class GamepadsWidget extends Widget {
    public readonly widgetId: string;
    private mouseHandler: MouseHandler;
    private vrManager: ThreejsVrManager;

    constructor(parameters: GamepadsWidgetParameters) {
        super();
        this.widgetId = 'l3graph-gamepad-widget';
        this.mouseHandler = parameters.mouseHandler;
    }

    setVrManager(vrManager: ThreejsVrManager) {
        this.vrManager = vrManager;
    }

    get gamepads() {
        const gamepads: VrGamepad[] = [];
        for (let gamepadID = 0; gamepadID < GAMEPADS_NUMBER; ++gamepadID) {
            gamepads.push(this.vrManager.getController(gamepadID));
        }
        return gamepads;
    }
}
