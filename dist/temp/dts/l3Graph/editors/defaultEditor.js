"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var utils_1 = require("../utils");
var diagramView_1 = require("../views/diagramView");
var link_1 = require("../models/graph/link");
var node_1 = require("../models/graph/node");
var gamepadHandler_1 = require("../vrUtils/gamepadHandler");
var WHEEL_STEP = 100;
var MIN_DISTANCE_TO_CAMERA = 10;
var GAMEPAD_EXTRA_MOVE_STEP = 10;
var DefaultEditor = /** @class */ (function () {
    function DefaultEditor(diagramModel, diagramView, mouseHandler, keyHandler, gamepadHandler) {
        var _this = this;
        this.diagramModel = diagramModel;
        this.diagramView = diagramView;
        this.mouseHandler = mouseHandler;
        this.keyHandler = keyHandler;
        this.gamepadHandler = gamepadHandler;
        this.helperMap = new Map();
        this.onGamepadDown = function (keyMap) {
            var leftTrigerTarget = keyMap.get(gamepadHandler_1.GAMEPAD_BUTTONS.LEFT_TRIGGER);
            var leftDraggingHelper = registerDnDHelper(_this.diagramView, gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER, leftTrigerTarget, _this.helperMap);
            var rightTrigerTarget = keyMap.get(gamepadHandler_1.GAMEPAD_BUTTONS.RIGHT_TRIGGER);
            var rightDraggingHelper = registerDnDHelper(_this.diagramView, gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER, rightTrigerTarget, _this.helperMap);
            if (leftDraggingHelper || rightDraggingHelper) {
                _this.gamepadHandler.on('keyUp', _this.onGamepadUp);
                _this.gamepadHandler.on('keyPressed', _this.onGamepadMove);
            }
        };
        this.onGamepadUp = function (event) {
            var keyMap = event.data;
            // todo: implement selection
            // let selectedElement: Element;
            if (keyMap.has(gamepadHandler_1.GAMEPAD_BUTTONS.LEFT_TRIGGER)) {
                switchOffDnDHelper(_this.diagramView, gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER, _this.helperMap);
            }
            if (keyMap.has(gamepadHandler_1.GAMEPAD_BUTTONS.RIGHT_TRIGGER)) {
                switchOffDnDHelper(_this.diagramView, gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER, _this.helperMap);
            }
            // selectedElement = keyMap.get(GAMEPAD_BUTTONS.RIGHT_TRIGGER) || keyMap.get(GAMEPAD_BUTTONS.LEFT_TRIGGER);
            if (_this.helperMap.size === 0) {
                _this.gamepadHandler.unsubscribe(_this.onGamepadUp);
                _this.gamepadHandler.unsubscribe(_this.onGamepadMove);
                // this.diagramModel.selection.setSelection(selectedElement ? new Set([selectedElement]) : new Set());
            }
        };
        this.onGamepadMove = function (event) {
            var keyMap = event.data;
            if (_this.helperMap.has(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER)) {
                var moveForward = keyMap.has(gamepadHandler_1.GAMEPAD_BUTTONS.Y);
                var moveBackward = keyMap.has(gamepadHandler_1.GAMEPAD_BUTTONS.X);
                onKeyMove(_this.diagramView, moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : moveBackward ? GAMEPAD_EXTRA_MOVE_STEP : 0, gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER, _this.helperMap);
            }
            if (_this.helperMap.has(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER)) {
                var moveForward = keyMap.has(gamepadHandler_1.GAMEPAD_BUTTONS.B);
                var moveBackward = keyMap.has(gamepadHandler_1.GAMEPAD_BUTTONS.A);
                onKeyMove(_this.diagramView, moveForward ? -GAMEPAD_EXTRA_MOVE_STEP : moveBackward ? GAMEPAD_EXTRA_MOVE_STEP : 0, gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER, _this.helperMap);
            }
        };
        this.mouseHandler.on('elementClick', function (e) {
            if (!_this.diagramModel.selection.elements.has(e.data.element)) {
                _this.diagramModel.selection.setSelection(new Set([e.data.element]));
            }
        });
        this.mouseHandler.on('paperClick', function (e) {
            _this.diagramModel.selection.setSelection(new Set());
        });
        this.mouseHandler.on('elementStartDrag', function (e) {
            _this.onElementDrag(e.data.nativeEvent, e.data.element);
        });
        this.mouseHandler.on('elementDrag', function (e) {
            _this.onElementDrag(e.data.nativeEvent, e.data.element);
        });
        this.mouseHandler.on('elementEndDrag', function (e) {
            _this.onElementDragEnd(e.data.nativeEvent, e.data.element);
        });
        this.keyHandler.on('keyPressed', function (e) { return _this.onKeyPressed(e.data); });
        this.gamepadHandler.on('keyDown', function (event) { return _this.onGamepadDown(event.data); });
    }
    DefaultEditor.prototype.onKeyPressed = function (keyMap) {
        if (keyMap.has(utils_1.KEY_CODES.DELETE) && this.diagramModel.selection.elements.size > 0) {
            var nodesToDelete_1 = [];
            var linksToDelete_1 = [];
            this.diagramModel.selection.elements.forEach(function (el) {
                if (el instanceof node_1.Node) {
                    nodesToDelete_1.push(el);
                }
                else {
                    linksToDelete_1.push(el);
                }
            });
            this.diagramModel.graph.removeLinks(linksToDelete_1);
            this.diagramModel.graph.removeNodes(nodesToDelete_1);
        }
    };
    DefaultEditor.prototype.onElementDrag = function (event, target) {
        if (target instanceof link_1.Link) {
            return;
        }
        if (event instanceof TouchEvent && event.touches.length === 0) {
            return;
        }
        var nodeThreePos = utils_1.vector3dToTreeVector3(target.position);
        var cameraPos = this.diagramView.camera.position;
        var distanceToNode = nodeThreePos.distanceTo(cameraPos);
        if (isMouseWheelEvent(event)) {
            var delata = -(event.deltaX || event.deltaY || event.deltaZ);
            distanceToNode += (delata > 0 ? 1 : -1) * WHEEL_STEP;
        }
        var size = target.size;
        var minDist = Math.max(size.x, size.y, size.z) / 2 + MIN_DISTANCE_TO_CAMERA;
        var limitedDistance = Math.max(distanceToNode, minDist);
        var newNodePosition = this.diagramView.mouseTo3dPos(event, limitedDistance);
        target.setPosition(newNodePosition);
    };
    DefaultEditor.prototype.onElementDragEnd = function (event, target) {
        this.onElementDrag(event, target);
    };
    return DefaultEditor;
}());
exports.DefaultEditor = DefaultEditor;
function registerDnDHelper(diagramView, controllerId, trigerTarget, helperMap) {
    if (trigerTarget && trigerTarget instanceof node_1.Node) {
        var controller = diagramView.renderer.vr.getController(controllerId);
        var elementMesh = diagramView.graphView.views.get(trigerTarget.id).mesh;
        if (controller) {
            var mockObject = elementMesh.clone();
            mockObject.visible = false;
            attach(mockObject, controller, diagramView.scene);
            var helper = {
                mockObject: mockObject,
                targetParent: diagramView.scene,
                node: trigerTarget,
            };
            helperMap.set(controllerId, helper);
            return helper;
        }
        return undefined;
    }
    return undefined;
}
function switchOffDnDHelper(diagramView, controllerId, helperMap) {
    var helper = helperMap.get(controllerId);
    if (helper) {
        var trigerTarget = helper.node;
        var controller = diagramView.renderer.vr.getController(controllerId);
        if (controller) {
            attach(helper.mockObject, helper.targetParent, diagramView.scene);
            trigerTarget.setPosition(utils_1.threeVector3ToVector3d(helper.mockObject.position));
            detach(helper.mockObject, helper.mockObject.parent, diagramView.scene);
            helperMap.delete(controllerId);
        }
    }
}
function onKeyMove(diagramView, zOffset, controllerId, helperMap) {
    var helper = helperMap.get(controllerId);
    if (helper) {
        var controller = diagramView.renderer.vr.getController(controllerId);
        if (controller) {
            attach(helper.mockObject, diagramView.scene, diagramView.scene);
            helper.node.setPosition(utils_1.threeVector3ToVector3d(helper.mockObject.position));
            attach(helper.mockObject, controller, diagramView.scene);
            if (zOffset !== 0) {
                var dist = helper.mockObject.position.z + zOffset;
                var fittingBox = utils_1.getModelFittingBox(helper.node.size);
                var limitedValue = Math.max(Math.min(Math.abs(dist), diagramView_1.DEFAULT_SCREEN_PARAMETERS.FAR), diagramView_1.DEFAULT_SCREEN_PARAMETERS.NEAR + fittingBox.deep / 2);
                helper.mockObject.position.setZ(dist > 0 ? limitedValue : -limitedValue);
            }
        }
    }
}
function isMouseWheelEvent(e) {
    return Boolean(e.deltaX || e.deltaY || e.deltaZ);
}
function attach(child, to, scene) {
    if (child.parent) {
        detach(child, child.parent, scene);
    }
    _attach(child, scene, to);
}
function detach(child, parent, scene) {
    child.applyMatrix(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
}
;
function _attach(child, scene, parent) {
    child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));
    scene.remove(child);
    parent.add(child);
}
;
