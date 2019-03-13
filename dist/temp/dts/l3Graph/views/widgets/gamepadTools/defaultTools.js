"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var gamepadHandler_1 = require("../../../vrUtils/gamepadHandler");
var utils_1 = require("../../../utils");
var SELECTION_COLOR = 'red';
var LEFT_GAMEPAD_COLOR = 'green';
var RIGHT_GAMEPAD_COLOR = 'blue';
var GamepadTool = /** @class */ (function (_super) {
    tslib_1.__extends(GamepadTool, _super);
    function GamepadTool() {
        var _this = _super.call(this) || this;
        _this.forceUpdate = function () {
            _this.trigger('update:gamepad');
        };
        return _this;
    }
    return GamepadTool;
}(utils_1.Subscribable));
exports.GamepadTool = GamepadTool;
var LeftGamepadTool = /** @class */ (function (_super) {
    tslib_1.__extends(LeftGamepadTool, _super);
    function LeftGamepadTool(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.TARGET_BUTTON = gamepadHandler_1.GAMEPAD_BUTTON.LEFT_TRIGGER;
        _this.updateMesh = function () {
            var color = _this.props.gamepadHandler.keyPressed.has(_this.TARGET_BUTTON) ? SELECTION_COLOR : _this.COLOR;
            utils_1.setColor(_this.mesh, color);
            _this.forceUpdate();
        };
        _this.forGamepadId = gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER;
        _this.props.gamepadHandler = props.gamepadHandler;
        _this.props.gamepadHandler.on('keyDown', _this.updateMesh);
        _this.props.gamepadHandler.on('keyUp', _this.updateMesh);
        _this.registerHighlighter();
        _this.registerBearer();
        _this.mesh = _this.renderMesh();
        return _this;
    }
    Object.defineProperty(LeftGamepadTool.prototype, "COLOR", {
        get: function () {
            return LEFT_GAMEPAD_COLOR;
        },
        enumerable: true,
        configurable: true
    });
    LeftGamepadTool.prototype.registerBearer = function () {
        var controller = this.props.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.props.gamepadHandler.registerElementBearer(controller, {
            dragKey: gamepadHandler_1.GAMEPAD_BUTTON.LEFT_TRIGGER,
            dragToKey: gamepadHandler_1.GAMEPAD_BUTTON.X,
            dragFromKey: gamepadHandler_1.GAMEPAD_BUTTON.Y,
        });
    };
    LeftGamepadTool.prototype.registerHighlighter = function () {
        var controller = this.props.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        this.props.gamepadHandler.registerHighligter(controller, function (mesh) {
            var backUp = utils_1.backupColors(mesh);
            utils_1.setColor(mesh, SELECTION_COLOR);
            return function (meshToRestore) { return utils_1.restoreColors(meshToRestore, backUp); };
        });
    };
    LeftGamepadTool.prototype.renderMesh = function () {
        var group = new THREE.Group();
        var pointerGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -50),
        ]);
        var lineMaterial = new THREE.LineBasicMaterial({ color: this.COLOR });
        var line = new THREE.Line(pointerGeometry, lineMaterial);
        group.add(line);
        var material = new THREE.MeshBasicMaterial({ color: this.COLOR });
        var geometry = new THREE.CylinderBufferGeometry(0.01, 0.01, 0.3, 10);
        var cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(0, 0, -0.05);
        cylinder.rotateX(Math.PI / 2);
        group.add(cylinder);
        return group;
    };
    LeftGamepadTool.prototype.onDiscard = function () {
        this.props.gamepadHandler.unsubscribe('keyUp', this.updateMesh);
        this.props.gamepadHandler.unsubscribe('keyDown', this.updateMesh);
    };
    return LeftGamepadTool;
}(GamepadTool));
exports.LeftGamepadTool = LeftGamepadTool;
var RightGamepadTool = /** @class */ (function (_super) {
    tslib_1.__extends(RightGamepadTool, _super);
    function RightGamepadTool(props) {
        var _this = _super.call(this, props) || this;
        _this.TARGET_BUTTON = gamepadHandler_1.GAMEPAD_BUTTON.RIGHT_TRIGGER;
        _this.forGamepadId = gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER;
        return _this;
    }
    Object.defineProperty(RightGamepadTool.prototype, "COLOR", {
        get: function () {
            return RIGHT_GAMEPAD_COLOR;
        },
        enumerable: true,
        configurable: true
    });
    RightGamepadTool.prototype.registerBearer = function () {
        var controller = this.props.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.props.gamepadHandler.registerElementBearer(controller, {
            dragKey: gamepadHandler_1.GAMEPAD_BUTTON.RIGHT_TRIGGER,
            dragToKey: gamepadHandler_1.GAMEPAD_BUTTON.A,
            dragFromKey: gamepadHandler_1.GAMEPAD_BUTTON.B,
        });
    };
    RightGamepadTool.prototype.registerHighlighter = function () {
        var controller = this.props.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        this.props.gamepadHandler.registerHighligter(controller, function (mesh) {
            var backUp = utils_1.backupColors(mesh);
            utils_1.setColor(mesh, SELECTION_COLOR);
            return function (meshToRestore) { return utils_1.restoreColors(meshToRestore, backUp); };
        });
    };
    return RightGamepadTool;
}(LeftGamepadTool));
exports.RightGamepadTool = RightGamepadTool;
