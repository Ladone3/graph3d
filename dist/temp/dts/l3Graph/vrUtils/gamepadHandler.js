"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var subscribable_1 = require("../utils/subscribable");
var utils_1 = require("../utils");
var diagramView_1 = require("../views/diagramView");
var mouseHandler_1 = require("../utils/mouseHandler");
var node_1 = require("../models/graph/node");
exports.GAMEPAD_EXTRA_MOVE_STEP = 10;
var OCULUS_BUTTON_CODES = {
    NIPPLE: 0,
    TRIGGER: 1,
    GRUBBER: 2,
    A_X: 3,
    B_Y: 4,
    OCULUS_MENU: 5,
};
var GAMEPAD_BUTTON;
(function (GAMEPAD_BUTTON) {
    GAMEPAD_BUTTON["LEFT_NIPPLE"] = "LEFT_NIPPLE";
    GAMEPAD_BUTTON["RIGHT_NIPPLE"] = "RIGHT_NIPPLE";
    GAMEPAD_BUTTON["LEFT_TRIGGER"] = "LEFT_TRIGGER";
    GAMEPAD_BUTTON["RIGHT_TRIGGER"] = "RIGHT_TRIGGER";
    GAMEPAD_BUTTON["LEFT_GRUBBER"] = "LEFT_GRUBBER";
    GAMEPAD_BUTTON["RIGHT_GRUBBER"] = "RIGHT_GRUBBER";
    GAMEPAD_BUTTON["A"] = "A";
    GAMEPAD_BUTTON["B"] = "B";
    GAMEPAD_BUTTON["X"] = "X";
    GAMEPAD_BUTTON["Y"] = "Y";
    GAMEPAD_BUTTON["OCULUS"] = "OCULUS";
    GAMEPAD_BUTTON["MENU"] = "MENU";
})(GAMEPAD_BUTTON = exports.GAMEPAD_BUTTON || (exports.GAMEPAD_BUTTON = {}));
exports.OCULUS_CONTROLLERS = {
    LEFT_CONTROLLER: 1,
    RIGHT_CONTROLLER: 0,
};
exports.CONTROLLERS_NUMBER = Object.keys(exports.OCULUS_CONTROLLERS).length;
// It's currently support only OCULUS gamepads
var GamepadHandler = /** @class */ (function (_super) {
    tslib_1.__extends(GamepadHandler, _super);
    function GamepadHandler(diagramModel, diagramView) {
        var _this = _super.call(this) || this;
        _this.diagramModel = diagramModel;
        _this.diagramView = diagramView;
        _this.keyPressed = new Map();
        _this.bearers = new Map();
        _this.highlighters = new Map();
        _this.existingControllersNumber = 0;
        _this.highlightingRestorers = new Map();
        _this.elementToController = new Map();
        _this.rayCaster = new THREE.Raycaster();
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
    GamepadHandler.prototype.registerHighlighter = function (controller, highlighter) {
        this.highlighters.set(controller, highlighter);
    };
    GamepadHandler.prototype.registerElementBearer = function (controller, bearer) {
        this.bearers.set(controller, bearer);
    };
    GamepadHandler.prototype.handleDraggingStart = function (keyDownMap) {
        var _this = this;
        this.bearers.forEach(function (bearer, controller) {
            if (keyDownMap.has(bearer.dragKey)) {
                var target = _this.keyPressed.get(bearer.dragKey);
                startDragging(target, _this.diagramView, controller, bearer);
                _this.trigger('elementDragStart', {
                    target: target,
                    position: bearer.position,
                });
            }
        });
    };
    GamepadHandler.prototype.handleDragging = function () {
        var _this = this;
        this.bearers.forEach(function (bearer, controller) {
            var moveForward = _this.keyPressed.has(bearer.dragFromKey);
            var moveBackward = _this.keyPressed.has(bearer.dragToKey);
            if (_this.keyPressed.has(bearer.dragKey) && bearer.target) {
                dragElement(_this.diagramView, moveForward ? -exports.GAMEPAD_EXTRA_MOVE_STEP : moveBackward ? exports.GAMEPAD_EXTRA_MOVE_STEP : 0, controller, bearer);
                _this.trigger('elementDrag', {
                    target: bearer.target,
                    position: bearer.position,
                });
            }
        });
    };
    GamepadHandler.prototype.handleDraggingEnd = function (keyUpMap) {
        var _this = this;
        this.bearers.forEach(function (bearer, controller) {
            if (keyUpMap.has(bearer.dragKey) && bearer.target) {
                stopDragging(bearer, _this.diagramView, controller);
                _this.trigger('elementDragEnd', {
                    target: bearer.target,
                    position: bearer.position,
                });
            }
        });
    };
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
    GamepadHandler.prototype.updateBtnMap = function () {
        var keyDown = new Map();
        var keyUp = new Map();
        var gamepadNumber = 0;
        for (var gamepadId = 0; gamepadId < exports.CONTROLLERS_NUMBER; gamepadId++) {
            var controller = this.diagramView.vrManager.getController(gamepadId);
            var gamepad = getGamepad(gamepadId);
            var gamepadExists = gamepad !== undefined && gamepad.pose;
            if (gamepadExists) {
                var target = this.getTarget(controller);
                this.updateHighlighting(controller, target);
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
            this.handleDraggingEnd(keyUp);
        }
        if (keyDown.size > 0) {
            this.trigger('keyDown', keyDown);
            this.handleDraggingStart(keyDown);
        }
        if (this.keyPressed.size > 0) {
            this.trigger('keyPressed', this.keyPressed);
            this.handleDragging();
        }
        if (gamepadNumber !== this.existingControllersNumber) {
            this.existingControllersNumber = gamepadNumber;
        }
    };
    GamepadHandler.prototype.getTarget = function (controller) {
        this.tempMatrix.identity().extractRotation(controller.matrixWorld);
        this.rayCaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        this.rayCaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
        var _a = mouseHandler_1.mapMeshes(this.diagramModel, this.diagramView), meshes = _a.meshes, nodeMeshMap = _a.nodeMeshMap;
        var intersections = this.rayCaster.intersectObjects(meshes);
        if (intersections.length > 0) {
            var intersectedMesh = intersections[0].object;
            var index = meshes.indexOf(intersectedMesh);
            return nodeMeshMap[index];
        }
        else {
            return undefined;
        }
    };
    GamepadHandler.prototype.updateHighlighting = function (controller, newTarget) {
        if (!this.highlighters.has(controller)) {
            return;
        }
        var restorer = this.highlightingRestorers.get(controller);
        if (newTarget) {
            var view = this.diagramView.graphView.nodeViews.get(newTarget.id);
            var targetMesh = view.mesh;
            var meshIsChanged = !restorer || restorer.mesh !== targetMesh;
            if (meshIsChanged) {
                if (this.elementToController.has(targetMesh)) {
                    return;
                }
                if (restorer) {
                    restorer.restore(restorer.mesh);
                    this.elementToController.delete(targetMesh);
                }
                var highlight = this.highlighters.get(controller);
                var restoreFunction = highlight(targetMesh);
                this.highlightingRestorers.set(controller, {
                    mesh: targetMesh,
                    restore: restoreFunction,
                });
                this.elementToController.set(targetMesh, controller);
            }
        }
        else {
            if (restorer) {
                this.highlightingRestorers.delete(controller);
                this.elementToController.delete(restorer.mesh);
                restorer.restore(restorer.mesh);
            }
        }
    };
    GamepadHandler.prototype.start = function () {
        var _this = this;
        if (this.cancellation) {
            return this.cancellation;
        }
        return utils_1.animationFrameInterval(function () {
            _this.updateBtnMap();
        });
    };
    return GamepadHandler;
}(subscribable_1.Subscribable));
exports.GamepadHandler = GamepadHandler;
function getOculusButton(gamepadId, buttonCode) {
    switch (buttonCode) {
        case OCULUS_BUTTON_CODES.TRIGGER:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.LEFT_TRIGGER;
            }
            else {
                return GAMEPAD_BUTTON.RIGHT_TRIGGER;
            }
        case OCULUS_BUTTON_CODES.GRUBBER:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.LEFT_GRUBBER;
            }
            else {
                return GAMEPAD_BUTTON.RIGHT_GRUBBER;
            }
        case OCULUS_BUTTON_CODES.NIPPLE:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.LEFT_NIPPLE;
            }
            else {
                return GAMEPAD_BUTTON.RIGHT_NIPPLE;
            }
        case OCULUS_BUTTON_CODES.A_X:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.X;
            }
            else {
                return GAMEPAD_BUTTON.A;
            }
        case OCULUS_BUTTON_CODES.B_Y:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.Y;
            }
            else {
                return GAMEPAD_BUTTON.B;
            }
        case OCULUS_BUTTON_CODES.OCULUS_MENU:
            if (gamepadId === exports.OCULUS_CONTROLLERS.LEFT_CONTROLLER) {
                return GAMEPAD_BUTTON.MENU;
            }
            else {
                return GAMEPAD_BUTTON.OCULUS;
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
            if (j === id) {
                return gamepad;
            }
            j++;
        }
    }
}
function startDragging(target, diagramView, controller, bearer) {
    if (target && target instanceof node_1.Node) {
        var elementMesh = diagramView.graphView.nodeViews.get(target.id).mesh;
        if (controller) {
            var mockObject = elementMesh.clone();
            mockObject.visible = false;
            attach(mockObject, controller, diagramView.scene);
            bearer.mockObject = mockObject;
            bearer.targetParent = diagramView.scene;
            bearer.target = target;
        }
    }
}
function dragElement(diagramView, zOffset, controller, bearer) {
    if (bearer) {
        if (controller) {
            attach(bearer.mockObject, diagramView.scene, diagramView.scene);
            bearer.position = utils_1.threeVector3ToVector3d(bearer.mockObject.position);
            attach(bearer.mockObject, controller, diagramView.scene);
            if (zOffset !== 0) {
                var dist = bearer.mockObject.position.z + zOffset;
                var fittingBox = utils_1.getModelFittingBox(bearer.target.size);
                var limitedValue = Math.max(Math.min(Math.abs(dist), diagramView_1.DEFAULT_SCREEN_PARAMETERS.FAR), diagramView_1.DEFAULT_SCREEN_PARAMETERS.NEAR + fittingBox.deep / 2);
                bearer.mockObject.position.setZ(dist > 0 ? limitedValue : -limitedValue);
            }
        }
    }
}
function stopDragging(bearer, diagramView, controller) {
    if (bearer) {
        if (controller) {
            attach(bearer.mockObject, bearer.targetParent, diagramView.scene);
            bearer.position = utils_1.threeVector3ToVector3d(bearer.mockObject.position);
            detach(bearer.mockObject, bearer.mockObject.parent, diagramView.scene);
            bearer.target = undefined;
            bearer.mockObject = undefined;
            bearer.targetParent = undefined;
        }
    }
}
function attach(child, to, scene) {
    if (child.parent) {
        detach(child, child.parent, scene);
    }
    _attach(child, scene, to);
}
exports.attach = attach;
function detach(child, parent, scene) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
}
exports.detach = detach;
function _attach(child, scene, parent) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));
    scene.remove(child);
    parent.add(child);
}
exports._attach = _attach;
