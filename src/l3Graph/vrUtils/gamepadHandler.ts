import { Subscribable } from '../utils/subscribeable';
import { Cancellation, animationFrameInterval } from '../utils';
import { VrEvent } from './webVr';

export interface GamepadHandlerEvents {
    'keyDown': Set<GAMEPAD_BUTTONS>;
    'keyUp': Set<GAMEPAD_BUTTONS>;
    'keyPressed': Set<GAMEPAD_BUTTONS>;
}

const OCULUS_BUTTON_CODES = {
    NIPPLE: 0,
    TRIGGER: 1,
    GRUBBER: 2,
    A_X: 3,
    B_Y: 4,
    OCULUS_MENU: 5, // Probably '5' but it's not stable. Five also appears at nipple changing axis
}

export enum GAMEPAD_BUTTONS {
    LEFT_NIPPLE='LEFT_NIPPLE',
    RIGHT_NIPPLE='RIGHT_NIPPLE',
    LEFT_TRIGGER='LEFT_TRIGGER',
    RIGHT_TRIGGER='RIGHT_TRIGGER',
    LEFT_GRUBBER='LEFT_GRUBBER',
    RIGHT_GRUBBER='RIGHT_GRUBBER',
    A='A',
    B='B',
    X='X',
    Y='Y', 
    OCULUS='OCULUS',
    MENU='MENU',
}

export const OCULUS_CONTROLLERS = {
    LEFT_CONTROLLER: 0,
    RIGHT_CONTROLLER: 1,
};
export const CONTROLLERS_NUMBER = Object.keys(OCULUS_CONTROLLERS).length;

// Now it's currently support only OCULUS gamepads
export class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    public readonly keyPressed = new Set<GAMEPAD_BUTTONS>();
    private cancellation: Cancellation | undefined;
    private existingControllersNumber = 0;

    constructor() {
        super();
        window.addEventListener('vrdisplaypresentchange', event => {
			const vrEvent = event as VrEvent;
			if (vrEvent.display.isPresenting) {
                this.switchOn();
            } else {
                this.switchOff();
            }
		}, false );
    }

    get activeGamepadNumber() {
        return this.existingControllersNumber;
    }

    private switchOn() {
        this.cancellation = this.start();
    }

    private switchOff() {
        if (!this.cancellation) { return; }
        this.cancellation.stop();
        this.cancellation = undefined;
    }

    private refreshBtnMap() {
        const keyDown = new Set<GAMEPAD_BUTTONS>();
        const keyUp = new Set<GAMEPAD_BUTTONS>();
        let gamepadNumber = 0;
        for (let gamepadId = 0; gamepadId < CONTROLLERS_NUMBER; gamepadId++) {
            const gamepad = getGamepad(gamepadId);
            const gamepadExists = gamepad !== undefined && gamepad.pose;
            if (gamepadExists) {
                gamepadNumber++;
                for(let buttonId = 0; buttonId < gamepad.buttons.length; buttonId++) {
                    if (buttonId === OCULUS_BUTTON_CODES.OCULUS_MENU) { // ignore these buttons
                        continue;
                    }
                    const button = getOculusButton(gamepadId, buttonId);
                    const wasPressed = this.keyPressed.has(button);
                    const isPressed = gamepad.buttons[buttonId].pressed;
                    if (isPressed && !wasPressed) {
                        keyDown.add(button);
                        this.keyPressed.add(button);
                    } else if (wasPressed && !isPressed) {
                        keyUp.add(button);
                        this.keyPressed.delete(button);
                    }
                }
            }
        }
        if (keyUp.size > 0) { this.trigger('keyUp', keyUp) }
        if (keyDown.size > 0) { this.trigger('keyDown', keyDown) }
        if (this.keyPressed.size > 0) { this.trigger('keyPressed', this.keyPressed) }
        if (gamepadNumber !== this.existingControllersNumber) { this.existingControllersNumber = gamepadNumber; }
    }

    private start(): Cancellation {
        if (this.cancellation) { return this.cancellation; }
        return animationFrameInterval(() => {
            this.refreshBtnMap();
        });
    }
}

function getOculusButton(gamepadId: number, buttonCode: number) {
    switch(buttonCode) {
        case OCULUS_BUTTON_CODES.TRIGGER:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.LEFT_TRIGGER;
            } else {
                return GAMEPAD_BUTTONS.RIGHT_TRIGGER;
            }
        case OCULUS_BUTTON_CODES.GRUBBER:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.LEFT_GRUBBER;
            } else {
                return GAMEPAD_BUTTONS.RIGHT_GRUBBER;
            }
        case OCULUS_BUTTON_CODES.NIPPLE:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.LEFT_NIPPLE;
            } else {
                return GAMEPAD_BUTTONS.RIGHT_NIPPLE;
            }
        case OCULUS_BUTTON_CODES.A_X:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.X;
            } else {
                return GAMEPAD_BUTTONS.A;
            }
        case OCULUS_BUTTON_CODES.B_Y:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.Y;
            } else {
                return GAMEPAD_BUTTONS.B;
            }
        case OCULUS_BUTTON_CODES.OCULUS_MENU:
            if (gamepadId === OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.MENU;
            } else {
                return GAMEPAD_BUTTONS.OCULUS;
            }
        default:
            return undefined;
    }
}

function getGamepad(id: string | number): Gamepad | undefined {
    const gamepads = navigator.getGamepads && navigator.getGamepads();

    for (let i = 0, j = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        if (gamepad && (
            gamepad.id === 'Daydream Controller' ||
            gamepad.id === 'Gear VR Controller' ||
            gamepad.id === 'Oculus Go Controller' ||
            gamepad.id === 'OpenVR Gamepad' ||
            gamepad.id.startsWith('Oculus Touch') ||
            gamepad.id.startsWith('Spatial Controller')
        )) {
            if (j === id) return gamepad;
            j++;
        }
    }
}
