"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var subscribeable_1 = require("../utils/subscribeable");
var utils_1 = require("../utils");
var mouseHandler_1 = require("../utils/mouseHandler");
var OCULUS_BUTTON_CODES = {
    NIPPLE: 0,
    TRIGGER: 1,
    GRUBBER: 2,
    A_X: 3,
    B_Y: 4,
    OCULUS_MENU: 5,
};
var GAMEPAD_BUTTONS;
(function (GAMEPAD_BUTTONS) {
    GAMEPAD_BUTTONS["LEFT_NIPPLE"] = "LEFT_NIPPLE";
    GAMEPAD_BUTTONS["RIGHT_NIPPLE"] = "RIGHT_NIPPLE";
    GAMEPAD_BUTTONS["LEFT_TRIGGER"] = "LEFT_TRIGGER";
    GAMEPAD_BUTTONS["RIGHT_TRIGGER"] = "RIGHT_TRIGGER";
    GAMEPAD_BUTTONS["LEFT_GRUBBER"] = "LEFT_GRUBBER";
    GAMEPAD_BUTTONS["RIGHT_GRUBBER"] = "RIGHT_GRUBBER";
    GAMEPAD_BUTTONS["A"] = "A";
    GAMEPAD_BUTTONS["B"] = "B";
    GAMEPAD_BUTTONS["X"] = "X";
    GAMEPAD_BUTTONS["Y"] = "Y";
    GAMEPAD_BUTTONS["OCULUS"] = "OCULUS";
    GAMEPAD_BUTTONS["MENU"] = "MENU";
})(GAMEPAD_BUTTONS = exports.GAMEPAD_BUTTONS || (exports.GAMEPAD_BUTTONS = {}));
var SELECTION_COLOR = 'red';
exports.OCULUS_CONTROLLERS = {
    LEFT_CONTROLLER: 0,
    RIGHT_CONTROLLER: 1,
};
exports.CONTROLLERS_NUMBER = Object.keys(exports.OCULUS_CONTROLLERS).length;
// Now it's currently support only OCULUS gamepads
var GamepadHandler = /** @class */ (function (_super) {
    tslib_1.__extends(GamepadHandler, _super);
    function GamepadHandler(diagramhModel, diagramView) {
        var _this = _super.call(this) || this;
        _this.diagramhModel = diagramhModel;
        _this.diagramView = diagramView;
        _this.keyPressed = new Map();
        _this.existingControllersNumber = 0;
        _this.targetMap = new Map();
        _this.materialMap = new Map();
        _this.raycaster = new THREE.Raycaster();
        _this.tempMatrix = new THREE.Matrix4();
        window.addEventListener('vrdisplaypresentchange', function (event) {
            var vrEvent = event;
            if (vrEvent.display.isPresenting) {
                _this.switchOn();
            }
            else {
                _this.switchOff();
            }
        }, false);
        return _this;
    }
    Object.defineProperty(GamepadHandler.prototype, "activeGamepadNumber", {
        get: function () {
            return this.existingControllersNumber;
        },
        enumerable: true,
        configurable: true
    });
    GamepadHandler.prototype.switchOn = function () {
        this.cancellation = this.start();
    };
    GamepadHandler.prototype.switchOff = function () {
        if (!this.cancellation) {
            return;
        }
        this.cancellation.stop();
        this.cancellation = undefined;
    };
    GamepadHandler.prototype.refreshBtnMap = function () {
        var keyDown = new Map();
        var keyUp = new Map();
        var gamepadNumber = 0;
        for (var gamepadId = 0; gamepadId < exports.CONTROLLERS_NUMBER; gamepadId++) {
            var gamepad = getGamepad(gamepadId);
            var gamepadExists = gamepad !== undefined && gamepad.pose;
            if (gamepadExists) {
                var target = this.getTarget(gamepadId);
                gamepadNumber++;
                for (var buttonId = 0; buttonId < gamepad.buttons.length; buttonId++) {
                    if (buttonId === OCULUS_BUTTON_CODES.OCULUS_MENU) { // ignore these buttons
                        continue;
                    }
                    var button = getOculusButton(gamepadId, buttonId);
                    var wasPressed = this.keyPressed.has(button);
                    var isPressed = gamepad.buttons[buttonId].pressed;
                    if (isPressed && !wasPressed) {
                        keyDown.set(button, target);
                        this.keyPressed.set(button, target);
                    }
                    else if (wasPressed && !isPressed) {
                        keyUp.set(button, this.keyPressed.get(button));
                        this.keyPressed.delete(button);
                    }
                }
            }
        }
        if (keyUp.size > 0) {
            this.trigger('keyUp', keyUp);
        }
        if (keyDown.size > 0) {
            this.trigger('keyDown', keyDown);
        }
        if (this.keyPressed.size > 0) {
            this.trigger('keyPressed', this.keyPressed);
        }
        if (gamepadNumber !== this.existingControllersNumber) {
            this.existingControllersNumber = gamepadNumber;
        }
    };
    GamepadHandler.prototype.getTarget = function (gamepadId) {
        // We can calculate It by ourself, but it's already implemented in three.js
        var controller = this.diagramView.renderer.vr.getController(gamepadId);
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);
        this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
        var _a = mouseHandler_1.mapMeshes(this.diagramhModel, this.diagramView), meshes = _a.meshes, nodeMeshMap = _a.nodeMeshMap;
        var intersections = this.raycaster.intersectObjects(meshes);
        // Highlighting todo: move this code out
        // =============================
        var previousSelection = this.targetMap.get(gamepadId);
        if (intersections.length > 0) {
            var intersectedMesh = intersections[0].object;
            var meshIsChanged = previousSelection !== intersectedMesh;
            if (meshIsChanged) {
                if (previousSelection) {
                    utils_1.restoreColors(previousSelection, this.materialMap.get(previousSelection));
                }
                this.targetMap.set(gamepadId, intersectedMesh);
                if (!this.materialMap.has(intersectedMesh))
                    this.materialMap.set(intersectedMesh, utils_1.backupColors(intersectedMesh));
                utils_1.setColor(intersectedMesh, SELECTION_COLOR);
            }
        }
        else {
            if (previousSelection) {
                this.targetMap.delete(gamepadId);
                if (Array.from(this.targetMap.values()).indexOf(previousSelection) === -1) {
                    utils_1.restoreColors(previousSelection, this.materialMap.get(previousSelection));
                }
            }
        }
        // =============================
        if (intersections.length > 0) {
            var intersectedMesh = intersections[0].object;
            var index = meshes.indexOf(intersectedMesh);
            return nodeMeshMap[index];
        }
        else {
            return undefined;
        }
    };
    GamepadHandler.prototype.start = function () {
        var _this = this;
        if (this.cancellation) {
            return this.cancellation;
        }
        return utils_1.animationFrameInterval(function () {
            _this.refreshBtnMap();
        });
    };
    return GamepadHandler;
}(subscribeable_1.Subscribable));
exports.GamepadHandler = GamepadHandler;
function getOculusButton(gamepadId, buttonCode) {
    switch (buttonCode) {
        case OCULUS_BUTTON_CODES.TRIGGER:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.LEFT_TRIGGER;
            }
            else {
                return GAMEPAD_BUTTONS.RIGHT_TRIGGER;
            }
        case OCULUS_BUTTON_CODES.GRUBBER:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.LEFT_GRUBBER;
            }
            else {
                return GAMEPAD_BUTTONS.RIGHT_GRUBBER;
            }
        case OCULUS_BUTTON_CODES.NIPPLE:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.LEFT_NIPPLE;
            }
            else {
                return GAMEPAD_BUTTONS.RIGHT_NIPPLE;
            }
        case OCULUS_BUTTON_CODES.A_X:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.X;
            }
            else {
                return GAMEPAD_BUTTONS.A;
            }
        case OCULUS_BUTTON_CODES.B_Y:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.Y;
            }
            else {
                return GAMEPAD_BUTTONS.B;
            }
        case OCULUS_BUTTON_CODES.OCULUS_MENU:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTONS.MENU;
            }
            else {
                return GAMEPAD_BUTTONS.OCULUS;
            }
        default:
            return undefined;
    }
}
function getGamepad(id) {
    var gamepads = navigator.getGamepads && navigator.getGamepads();
    for (var i = 0, j = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        if (gamepad && (gamepad.id === 'Daydream Controller' ||
            gamepad.id === 'Gear VR Controller' ||
            gamepad.id === 'Oculus Go Controller' ||
            gamepad.id === 'OpenVR Gamepad' ||
            gamepad.id.startsWith('Oculus Touch') ||
            gamepad.id.startsWith('Spatial Controller'))) {
            if (j === id)
                return gamepad;
            j++;
        }
    }
}
