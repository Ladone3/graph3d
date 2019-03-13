Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var subscribable_1 = require("../utils/subscribable");
var utils_1 = require("../utils");
var mouseHandler_1 = require("./mouseHandler");
var node_1 = require("../models/graph/node");
exports.GAMEPAD_EXTRA_MOVE_STEP = 10;
var GAMEPAD_BUTTON;
(function (GAMEPAD_BUTTON) {
    GAMEPAD_BUTTON["TRIGGER"] = "TRIGGER";
    GAMEPAD_BUTTON["GRUBBER"] = "GRUBBER";
})(GAMEPAD_BUTTON = exports.GAMEPAD_BUTTON || (exports.GAMEPAD_BUTTON = {}));
exports.OCULUS_CONTROLLERS = {
    LEFT_CONTROLLER: 1,
    RIGHT_CONTROLLER: 0,
};
exports.CONTROLLERS_NUMBER = Object.keys(exports.OCULUS_CONTROLLERS).length;
var GamepadHandler = (function (_super) {
    tslib_1.__extends(GamepadHandler, _super);
    function GamepadHandler(diagramModel, diagramView) {
        var _this = _super.call(this) || this;
        _this.diagramModel = diagramModel;
        _this.diagramView = diagramView;
        _this._keyPressedMap = new Map();
        _this.targets = new Map();
        _this.dragStates = new Map();
        _this.draggedBy = function (element) {
            var dragged;
            _this.dragStates.forEach(function (dragState) {
                if (element === dragState.target && !dragged) {
                    dragged = dragState;
                }
            });
            return dragged;
        };
        _this.rayCaster = new THREE.Raycaster();
        _this.tempMatrix = new THREE.Matrix4();
        _this.diagramView.core.vrManager.on('connection:state:changed', function () {
            if (_this.diagramView.core.vrManager.isConnected) {
                _this.cancellation = _this.start();
                _this.subscribeOnControllers();
            }
            else {
                if (_this.cancellation) {
                    _this.cancellation.stop();
                    _this.cancellation = undefined;
                    _this.unsubscribeFromController();
                }
            }
        });
        return _this;
    }
    GamepadHandler.prototype.getController = function (controllerId) {
        return this.diagramView.core.vrManager.getController(controllerId);
    };
    Object.defineProperty(GamepadHandler.prototype, "keyPressedMap", {
        get: function () {
            return this._keyPressedMap;
        },
        enumerable: true,
        configurable: true
    });
    GamepadHandler.prototype.subscribeOnControllers = function () {
        var _this = this;
        var _loop_1 = function (controllerId) {
            var controller = this_1.diagramView.core.vrManager.getController(controllerId);
            if (!controller) {
                return "continue";
            }
            this_1._keyPressedMap.set(controller, new Set());
            var onDragStart = function () {
                _this._keyPressedMap.get(controller).add(GAMEPAD_BUTTON.TRIGGER);
                _this.trigger('keyDown', {
                    controller: controller, button: GAMEPAD_BUTTON.TRIGGER,
                });
                if (!dragState.isDragging) {
                    _this.onDragStartEvent(controller);
                }
            };
            var onDragEnd = function () {
                _this._keyPressedMap.get(controller).delete(GAMEPAD_BUTTON.TRIGGER);
                _this.trigger('keyUp', {
                    controller: controller, button: GAMEPAD_BUTTON.TRIGGER,
                });
                _this.onDragEndEvent(dragState);
            };
            var dragState = {
                controller: controller,
                unsubscribe: function () {
                    controller.removeEventListener('selectstart', onDragStart);
                    controller.removeEventListener('selectend', onDragEnd);
                    controller.removeEventListener('squeezestart', onDragStart);
                    controller.removeEventListener('squeezeend', onDragEnd);
                },
            };
            this_1.dragStates.set(controller, dragState);
            controller.addEventListener('selectstart', onDragStart);
            controller.addEventListener('selectend', onDragEnd);
            controller.addEventListener('squeezestart', onDragStart);
            controller.addEventListener('squeezeend', onDragEnd);
        };
        var this_1 = this;
        for (var controllerId = 0; controllerId < exports.CONTROLLERS_NUMBER; controllerId++) {
            _loop_1(controllerId);
        }
    };
    GamepadHandler.prototype.unsubscribeFromController = function () {
        for (var controllerId = 0; controllerId < exports.CONTROLLERS_NUMBER; controllerId++) {
            var controller = this.diagramView.core.vrManager.getController(controllerId);
            if (!controller) {
                continue;
            }
            var dragState = this.dragStates.get(controller);
            dragState.unsubscribe();
            this.dragStates.delete(controller);
        }
    };
    GamepadHandler.prototype.onDragStartEvent = function (controller) {
        var target = this.targets.get(controller);
        var dragState = this.dragStates.get(controller);
        if (target) {
            var draggedBy = this.draggedBy(target);
            if (draggedBy) {
                startCompanionDragging(target, dragState, draggedBy);
            }
            else {
                startDragging(target, this.diagramView, dragState);
                this.trigger('elementDragStart', {
                    target: target,
                    position: dragState.position,
                });
            }
        }
    };
    GamepadHandler.prototype.onDrag = function (dragState) {
        if (!(dragState && dragState.isDragging && !dragState.dragCompanionFor)) {
            return;
        }
        dragElement(this.diagramView, dragState);
        this.trigger('elementDrag', {
            target: dragState.target,
            position: dragState.position,
        });
    };
    GamepadHandler.prototype.onDragEndEvent = function (dragState) {
        stopDragging(dragState, this.diagramView);
        if (!dragState.isDragging) {
            return;
        }
        var target = dragState.target;
        this.trigger('elementDragEnd', {
            target: target,
            position: dragState.position,
        });
    };
    GamepadHandler.prototype.handlerTimeLoop = function () {
        for (var controllerId = 0; controllerId < exports.CONTROLLERS_NUMBER; controllerId++) {
            var controller = this.diagramView.core.vrManager.getController(controllerId);
            if (!controller) {
                continue;
            }
            var prevTarget = this.targets.get(controller);
            var target = this.getTarget(controller);
            if (prevTarget) {
                if (target && target === prevTarget) {
                    this.trigger('elementHover', {
                        target: target,
                        position: target instanceof node_1.Node ? target.position : undefined,
                    });
                }
                else {
                    this.targets.delete(controller);
                    this.trigger('elementHoverEnd', {
                        target: prevTarget,
                        position: prevTarget instanceof node_1.Node ? prevTarget.position : undefined,
                    });
                }
            }
            else {
                if (target) {
                    this.targets.set(controller, target);
                    this.trigger('elementHoverStart', {
                        target: target,
                        position: target instanceof node_1.Node ? target.position : undefined,
                    });
                }
            }
            var dragState = this.dragStates.get(controller);
            this.onDrag(dragState);
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
    GamepadHandler.prototype.start = function () {
        var _this = this;
        if (this.cancellation) {
            return this.cancellation;
        }
        return this.diagramView.core.animationFrameInterval(function () {
            _this.handlerTimeLoop();
        });
    };
    return GamepadHandler;
}(subscribable_1.Subscribable));
exports.GamepadHandler = GamepadHandler;
function startDragging(target, diagramView, dragState) {
    if (target && target instanceof node_1.Node) {
        var mockObject = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 'red' }));
        mockObject.position.set(target.position.x, target.position.y, target.position.z);
        mockObject.visible = false;
        attach(mockObject, dragState.controller, diagramView.core.scene);
        dragState.isDragging = true;
        dragState.mockObject = mockObject;
        dragState.targetParent = diagramView.core.scene;
        dragState.target = target;
        dragState.position = target.position;
        dragState.dragCompanionFor = undefined;
        dragState.startControllerPosition = utils_1.threeVector3ToVector3d(dragState.controller.position);
        dragState.startTargetPosition = dragState.target.position;
    }
}
function startCompanionDragging(target, dragState, dragBase) {
    if (target && target instanceof node_1.Node) {
        dragBase.dragCompanion = dragState;
        dragState.dragCompanionFor = dragBase;
        dragState.startControllerPosition = utils_1.threeVector3ToVector3d(dragState.controller.position);
        dragState.startTargetPosition = dragState.target.position;
    }
}
function dragElement(diagramView, dragState) {
    if (dragState) {
        attach(dragState.mockObject, diagramView.core.scene, diagramView.core.scene);
        if (dragState.dragCompanion) {
            dragState.position = getNewPosition(dragState, dragState.dragCompanion, diagramView.core.screenParameters.FAR);
            dragState.mockObject.position.set(dragState.position.x, dragState.position.y, dragState.position.z);
        }
        else {
            dragState.position = utils_1.threeVector3ToVector3d(dragState.mockObject.position);
        }
        attach(dragState.mockObject, dragState.controller, diagramView.core.scene);
    }
}
function getNewPosition(baseState, companionState, maxDistance) {
    var direction1 = utils_1.sub(utils_1.threeVector3ToVector3d(new THREE.Vector3(0, 0, -1)
        .applyMatrix4(baseState.controller.matrixWorld)), utils_1.threeVector3ToVector3d(baseState.controller.position));
    var direction2 = utils_1.sub(utils_1.threeVector3ToVector3d(new THREE.Vector3(0, 0, -1)
        .applyMatrix4(companionState.controller.matrixWorld)), utils_1.threeVector3ToVector3d(companionState.controller.position));
    var startDist = utils_1.distance(baseState.startControllerPosition, companionState.startControllerPosition);
    var curDist = utils_1.distance(baseState.controller.position, companionState.controller.position);
    var k = Math.pow(curDist / startDist, 2);
    var initialTargetDist = utils_1.distance(baseState.startTargetPosition, baseState.startControllerPosition);
    var p1 = utils_1.sum(baseState.controller.position, utils_1.multiply(direction1, Math.min(initialTargetDist * k, maxDistance)));
    var p2 = utils_1.sum(baseState.controller.position, utils_1.multiply(direction2, Math.min(initialTargetDist * k, maxDistance)));
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        z: (p1.z + p2.z) / 2,
    };
}
function getNewPositionOld(baseState, companionState, maxDistance) {
    var c1 = baseState.controller;
    var c2 = companionState.controller;
    var v1 = {
        start: utils_1.threeVector3ToVector3d(c1.position),
        end: utils_1.threeVector3ToVector3d(new THREE.Vector3(0, 0, -1)
            .applyMatrix4(c1.matrixWorld)),
    };
    var v2 = {
        start: utils_1.threeVector3ToVector3d(c2.position),
        end: utils_1.threeVector3ToVector3d(new THREE.Vector3(0, 0, -1)
            .applyMatrix4(c2.matrixWorld)),
    };
    return utils_1.sum(utils_1.multiply(utils_1.sub(getCrossingPoint(v1, v2, maxDistance), v1.start), 10), v1.start);
}
function getCrossingPoint(v1, v2, maxDistance) {
    var direction1 = utils_1.sub(v1.end, v1.start);
    var direction2 = utils_1.sub(v2.end, v2.start);
    var getPointOnDirection = function (direction, dist, offset) { return utils_1.sum(offset, utils_1.multiply(direction, dist)); };
    var MAX_ITERATIONS = 16;
    var step = 2;
    var curPos = maxDistance / step;
    var returnResult = function () {
        var p1 = getPointOnDirection(direction1, curPos, v1.start);
        var p2 = getPointOnDirection(direction2, curPos, v2.start);
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
            z: (p1.z + p2.z) / 2,
        };
    };
    for (var i = 0; i < MAX_ITERATIONS; i++) {
        step *= 2;
        var nextPos1 = curPos + maxDistance / step;
        var p1_1 = getPointOnDirection(direction1, nextPos1, v1.start);
        var p1_2 = getPointOnDirection(direction2, nextPos1, v2.start);
        var dist1 = utils_1.distance(p1_1, p1_2);
        var nextPos2 = curPos - maxDistance / step;
        var p2_1 = getPointOnDirection(direction1, nextPos2, v1.start);
        var p2_2 = getPointOnDirection(direction2, nextPos2, v2.start);
        var dist2 = utils_1.distance(p2_1, p2_2);
        if (dist1 < dist2) {
            curPos = curPos + maxDistance / step;
        }
        else if (dist1 > dist2) {
            curPos = curPos - maxDistance / step;
        }
        else {
            return returnResult();
        }
    }
    return returnResult();
}
function stopDragging(dragState, diagramView) {
    if (dragState.dragCompanionFor) {
        dragState.dragCompanionFor.dragCompanion = undefined;
    }
    if (dragState.dragCompanion) {
        dragState.dragCompanion.dragCompanionFor = undefined;
    }
    attach(dragState.mockObject, dragState.targetParent, diagramView.core.scene);
    dragState.position = utils_1.threeVector3ToVector3d(dragState.mockObject.position);
    detach(dragState.mockObject, dragState.mockObject.parent, diagramView.core.scene);
    dragState.target = undefined;
    dragState.mockObject = undefined;
    dragState.targetParent = undefined;
    dragState.isDragging = false;
    dragState.dragCompanionFor = undefined;
    dragState.dragCompanion = undefined;
}
function attach(child, to, scene) {
    if (!(child && scene && to)) {
        throw new Error('Inconsistent state!');
    }
    if (child.parent) {
        detach(child, child.parent, scene);
    }
    _attach(child, scene, to);
}
exports.attach = attach;
function detach(child, parent, scene) {
    child.applyMatrix4(parent.matrixWorld);
    parent.remove(child);
    scene.add(child);
}
exports.detach = detach;
function _attach(child, scene, parent) {
    child.applyMatrix4(new THREE.Matrix4().getInverse(parent.matrixWorld));
    scene.remove(child);
    parent.add(child);
}
exports._attach = _attach;
