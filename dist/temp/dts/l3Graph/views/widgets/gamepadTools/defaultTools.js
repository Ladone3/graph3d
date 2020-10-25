Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var gamepadHandler_1 = require("../../../input/gamepadHandler");
var utils_1 = require("../../../utils");
var SELECTION_COLOR = 'red';
var LEFT_GAMEPAD_COLOR = 'green';
var RIGHT_GAMEPAD_COLOR = 'blue';
var GamepadTool = (function (_super) {
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
var LeftGamepadTool = (function (_super) {
    tslib_1.__extends(LeftGamepadTool, _super);
    function LeftGamepadTool(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.updateMesh = function () {
            var keyPressedMap = _this.props.gamepadHandler.keyPressedMap.get(_this.controller);
            var color = keyPressedMap && keyPressedMap.size > 0 ?
                SELECTION_COLOR : _this.COLOR;
            utils_1.setColor(_this.mesh, color);
            _this.forceUpdate();
        };
        _this.props.gamepadHandler.on('keyDown', _this.updateMesh);
        _this.props.gamepadHandler.on('keyUp', _this.updateMesh);
        _this.mesh = _this.renderMesh();
        return _this;
    }
    Object.defineProperty(LeftGamepadTool.prototype, "controller", {
        get: function () {
            return this.props.gamepadHandler.getController(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LeftGamepadTool.prototype, "COLOR", {
        get: function () {
            return LEFT_GAMEPAD_COLOR;
        },
        enumerable: true,
        configurable: true
    });
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
    LeftGamepadTool.prototype.discard = function () {
        this.props.gamepadHandler.unsubscribe('keyUp', this.updateMesh);
        this.props.gamepadHandler.unsubscribe('keyDown', this.updateMesh);
    };
    return LeftGamepadTool;
}(GamepadTool));
exports.LeftGamepadTool = LeftGamepadTool;
var RightGamepadTool = (function (_super) {
    tslib_1.__extends(RightGamepadTool, _super);
    function RightGamepadTool(props) {
        var _this = _super.call(this, props) || this;
        _this.TARGET_BUTTON = gamepadHandler_1.GAMEPAD_BUTTON.TRIGGER;
        return _this;
    }
    Object.defineProperty(RightGamepadTool.prototype, "COLOR", {
        get: function () {
            return RIGHT_GAMEPAD_COLOR;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RightGamepadTool.prototype, "controller", {
        get: function () {
            return this.props.gamepadHandler.getController(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        },
        enumerable: true,
        configurable: true
    });
    return RightGamepadTool;
}(LeftGamepadTool));
exports.RightGamepadTool = RightGamepadTool;
