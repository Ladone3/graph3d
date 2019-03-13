Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var subscribable_1 = require("../utils/subscribable");
var utils_1 = require("../utils");
var diagramView_1 = require("../views/diagramView");
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
        _this.subscriptions = new Map();
        _this.rayCaster = new THREE.Raycaster();
        _this.tempMatrix = new THREE.Matrix4();
        _this.diagramView.vrManager.on('connection:state:changed', function () {
            if (_this.diagramView.vrManager.isConnected) {
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
        return this.diagramView.vrManager.getController(controllerId);
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
            var controller = this_1.diagramView.vrManager.getController(controllerId);
            if (!controller) {
                return "continue";
            }
            this_1._keyPressedMap.set(controller, new Set());
            var subscription = {
                onDragStart: function () {
                    _this._keyPressedMap.get(controller).add(GAMEPAD_BUTTON.TRIGGER);
                    _this.trigger('keyDown', {
                        controller: controller, button: GAMEPAD_BUTTON.TRIGGER,
                    });
                    if (!subscription.isDragging) {
                        _this.onDragStartEvent(controller);
                    }
                },
                onDrag: function () { return _this.onDragEvent(controller); },
                onDragEnd: function () {
                    _this._keyPressedMap.get(controller).delete(GAMEPAD_BUTTON.TRIGGER);
                    _this.trigger('keyUp', {
                        controller: controller, button: GAMEPAD_BUTTON.TRIGGER,
                    });
                    if (subscription.isDragging) {
                        _this.onDragEndEvent(controller);
                    }
                },
            };
            this_1.subscriptions.set(controller, subscription);
            controller.addEventListener('selectstart', subscription.onDragStart);
            controller.addEventListener('selectend', subscription.onDragEnd);
            controller.addEventListener('squeezestart', subscription.onDragStart);
            controller.addEventListener('squeezeend', subscription.onDragEnd);
        };
        var this_1 = this;
        for (var controllerId = 0; controllerId < exports.CONTROLLERS_NUMBER; controllerId++) {
            _loop_1(controllerId);
        }
    };
    GamepadHandler.prototype.unsubscribeFromController = function () {
        for (var controllerId = 0; controllerId < exports.CONTROLLERS_NUMBER; controllerId++) {
            var controller = this.diagramView.vrManager.getController(controllerId);
            if (!controller) {
                continue;
            }
            var subscription = this.subscriptions.get(controller);
            controller.removeEventListener('selectstart', subscription.onDragStart);
            controller.removeEventListener('selectend', subscription.onDragEnd);
            controller.removeEventListener('squeezestart', subscription.onDragStart);
            controller.removeEventListener('squeezeend', subscription.onDragEnd);
            this.subscriptions.delete(controller);
        }
    };
    GamepadHandler.prototype.onDragStartEvent = function (controller) {
        var target = this.targets.get(controller);
        var subscription = this.subscriptions.get(controller);
        if (target) {
            startDragging(target, this.diagramView, controller, subscription);
            this.trigger('elementDragStart', {
                target: target,
                position: subscription.position,
            });
        }
    };
    GamepadHandler.prototype.onDragEvent = function (controller) {
        var subscription = this.subscriptions.get(controller);
        dragElement(this.diagramView, 0, controller, subscription);
        this.trigger('elementDrag', {
            target: subscription.target,
            position: subscription.position,
        });
    };
    GamepadHandler.prototype.onDragEndEvent = function (controller) {
        var subscription = this.subscriptions.get(controller);
        var target = subscription.target;
        stopDragging(subscription, this.diagramView, controller);
        this.trigger('elementDragEnd', {
            target: target,
            position: subscription.position,
        });
    };
    GamepadHandler.prototype.handlerTimeLoop = function () {
        for (var controllerId = 0; controllerId < exports.CONTROLLERS_NUMBER; controllerId++) {
            var controller = this.diagramView.vrManager.getController(controllerId);
            if (!controller) {
                continue;
            }
            var prevTarget = this.targets.get(controller);
            var target = this.getTarget(controller);
            if (prevTarget) {
                if (target) {
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
            var subscription = this.subscriptions.get(controller);
            if (subscription && subscription.isDragging) {
                subscription.onDrag();
            }
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
        return utils_1.animationFrameInterval(function () {
            _this.handlerTimeLoop();
        });
    };
    return GamepadHandler;
}(subscribable_1.Subscribable));
exports.GamepadHandler = GamepadHandler;
function startDragging(target, diagramView, controller, subscription) {
    if (target && target instanceof node_1.Node) {
        var elementMesh = diagramView.graphView.nodeViews.get(target).mesh;
        if (controller) {
            var mockObject = elementMesh.clone();
            mockObject.visible = false;
            attach(mockObject, controller, diagramView.scene);
            subscription.isDragging = true;
            subscription.mockObject = mockObject;
            subscription.targetParent = diagramView.scene;
            subscription.target = target;
            subscription.position = target.position;
        }
    }
}
function dragElement(diagramView, zOffset, controller, subscription) {
    if (subscription) {
        if (controller) {
            attach(subscription.mockObject, diagramView.scene, diagramView.scene);
            subscription.position = utils_1.threeVector3ToVector3d(subscription.mockObject.position);
            attach(subscription.mockObject, controller, diagramView.scene);
            if (zOffset !== 0) {
                var dist = subscription.mockObject.position.z + zOffset;
                var fittingBox = utils_1.getModelFittingBox(subscription.target.size);
                var limitedValue = Math.max(Math.min(Math.abs(dist), diagramView_1.DEFAULT_SCREEN_PARAMETERS.FAR), diagramView_1.DEFAULT_SCREEN_PARAMETERS.NEAR + fittingBox.deep / 2);
                subscription.mockObject.position.setZ(dist > 0 ? limitedValue : -limitedValue);
            }
        }
    }
}
function stopDragging(subscription, diagramView, controller) {
    if (subscription) {
        if (controller) {
            attach(subscription.mockObject, subscription.targetParent, diagramView.scene);
            subscription.position = utils_1.threeVector3ToVector3d(subscription.mockObject.position);
            detach(subscription.mockObject, subscription.mockObject.parent, diagramView.scene);
            subscription.target = undefined;
            subscription.mockObject = undefined;
            subscription.targetParent = undefined;
            subscription.isDragging = false;
        }
    }
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
