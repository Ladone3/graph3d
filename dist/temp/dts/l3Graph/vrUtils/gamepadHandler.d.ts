import { Subscribable } from '../utils/subscribeable';
import { Element } from '../models/graph/graphModel';
import { DiagramModel } from '../models/diagramModel';
import { DiagramView } from '../views/diagramView';
export interface GamepadHandlerEvents {
    'keyDown': Map<GAMEPAD_BUTTONS, Element | undefined>;
    'keyUp': Map<GAMEPAD_BUTTONS, Element | undefined>;
    'keyPressed': Map<GAMEPAD_BUTTONS, Element | undefined>;
}
export declare enum GAMEPAD_BUTTONS {
    LEFT_NIPPLE = "LEFT_NIPPLE",
    RIGHT_NIPPLE = "RIGHT_NIPPLE",
    LEFT_TRIGGER = "LEFT_TRIGGER",
    RIGHT_TRIGGER = "RIGHT_TRIGGER",
    LEFT_GRUBBER = "LEFT_GRUBBER",
    RIGHT_GRUBBER = "RIGHT_GRUBBER",
    A = "A",
    B = "B",
    X = "X",
    Y = "Y",
    OCULUS = "OCULUS",
    MENU = "MENU"
}
export declare const OCULUS_CONTROLLERS: {
    LEFT_CONTROLLER: number;
    RIGHT_CONTROLLER: number;
};
export declare const CONTROLLERS_NUMBER: number;
export declare class GamepadHandler extends Subscribable<GamepadHandlerEvents> {
    private diagramhModel;
    private diagramView;
    readonly keyPressed: Map<GAMEPAD_BUTTONS, Element>;
    private cancellation;
    private existingControllersNumber;
    private raycaster;
    private tempMatrix;
    private targetMap;
    private materialMap;
    constructor(diagramhModel: DiagramModel, diagramView: DiagramView);
    readonly activeGamepadNumber: number;
    private switchOn;
    private switchOff;
    private refreshBtnMap;
    private getTarget;
    private start;
}
