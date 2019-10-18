import { MouseHandler } from '../../utils/mouseHandler';
import { Widget } from './widget';
import { ThreejsVrManager, VrGamepad } from '../../vrUtils/webVr';

export interface GamepadsWidgetParameters {
    mouseHandler: MouseHandler;
}

export const GAMEPADS_NUMBER = 2;
const BASIC_COLOR_ORDER = ['green', 'blue'];

export class GamepadsWidget extends Widget {
    public readonly widgetId: string;
    private mouseHandler: MouseHandler;
    private vrManager: ThreejsVrManager;
    private _gamepads: Map<number, VrGamepad>;

    constructor(parameters: GamepadsWidgetParameters) {
        super();
        this.widgetId = 'l3graph-gamepad-widget';
        this.mouseHandler = parameters.mouseHandler;
    }

    setVrManager(vrManager: ThreejsVrManager) {
        this.vrManager = vrManager;
        const gamepads = new Map<number, VrGamepad>();
        for (let gamepadId = 0; gamepadId < GAMEPADS_NUMBER; ++gamepadId) {
            const controller = this.vrManager.getController(gamepadId);
            if (controller) {
                const gamepad: VrGamepad = {
                    id: gamepadId,
                    group: controller,
                    selectPressed: false,
                    color: BASIC_COLOR_ORDER[gamepadId % BASIC_COLOR_ORDER.length],
                };
                controller.addEventListener('selectstart', () => {
                    gamepad.selectPressed = true;
                    this.forceUpdate();
                });
                controller.addEventListener('selectend', () => {
                    gamepad.selectPressed = false;
                    this.forceUpdate();
                });
                gamepads.set(gamepad.id, gamepad);
            }
        }
        this._gamepads = gamepads;
    }

    get gamepads() {
        return this._gamepads;
    }
}
