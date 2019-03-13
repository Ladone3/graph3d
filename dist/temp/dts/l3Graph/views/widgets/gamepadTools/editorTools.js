"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var gamepadHandler_1 = require("../../../vrUtils/gamepadHandler");
var utils_1 = require("../../../utils");
var customization_1 = require("../../../customization");
var defaultTools_1 = require("./defaultTools");
var diagramView_1 = require("../../diagramView");
var imageMesh_1 = require("./imageMesh");
exports.DISPLAY_TARGET_WIDTH = 0.2;
exports.DISPLAY_OFFSET = -5;
exports.MOC_OBJECT_RADIUS = 10;
exports.MOC_OBJECT_NEAR_MARGIN = 20;
var TOOL_MESH = {
    color: 'gray',
    preserveRatio: true,
    type: customization_1.MeshKind.Obj,
    markup: require('../../../../shapes/gamepadCreator.obj'),
};
var PLUS_MESH = {
    color: 'gray',
    preserveRatio: true,
    type: customization_1.MeshKind.Obj,
    markup: require('../../../../shapes/plus.obj'),
};
var LEFT_GAMEPAD_COLOR = 'green';
var RIGHT_GAMEPAD_COLOR = 'blue';
var DEFAULT_CREATION_DISTANCE = 150;
var LeftGamepadEditorTool = /** @class */ (function (_super) {
    tslib_1.__extends(LeftGamepadEditorTool, _super);
    function LeftGamepadEditorTool(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.render = function () {
            _this.display.position.setX(-exports.DISPLAY_TARGET_WIDTH + exports.DISPLAY_OFFSET);
        };
        _this.onKeyPressed = function (e) {
            if (e.data.has(_this.BUTTON_CONFIG.pushMock) || e.data.has(_this.BUTTON_CONFIG.pullMock)) {
                var distance = _this.mockObject.position.z;
                if (e.data.has(_this.BUTTON_CONFIG.pushMock) && !e.data.has(_this.BUTTON_CONFIG.pullMock)) {
                    distance -= gamepadHandler_1.GAMEPAD_EXTRA_MOVE_STEP;
                }
                else if (e.data.has(_this.BUTTON_CONFIG.pullMock) && !e.data.has(_this.BUTTON_CONFIG.pushMock)) {
                    distance += gamepadHandler_1.GAMEPAD_EXTRA_MOVE_STEP;
                }
                var limitedValue = Math.max(Math.min(Math.abs(distance), diagramView_1.DEFAULT_SCREEN_PARAMETERS.FAR), diagramView_1.DEFAULT_SCREEN_PARAMETERS.NEAR + exports.MOC_OBJECT_RADIUS / 2 + exports.MOC_OBJECT_NEAR_MARGIN);
                _this.mockObject.position.setZ(-limitedValue);
            }
        };
        var _a = renderEditorToolMesh(_this.COLOR, _this.ROTATE_Y_ANGLE, DEFAULT_CREATION_DISTANCE), group = _a.group, mockObject = _a.mockObject;
        _this.forGamepadId = gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER;
        _this.mockObject = mockObject;
        _this.mesh = group;
        _this.display = new imageMesh_1.ImageMesh({
            size: { x: exports.DISPLAY_TARGET_WIDTH, y: exports.DISPLAY_TARGET_WIDTH },
        });
        _this.display.position.setX(-exports.DISPLAY_TARGET_WIDTH + exports.DISPLAY_OFFSET);
        _this.display.rotateX(-Math.PI / 6);
        _this.mesh.add(_this.display);
        _this.props.gamepadHandler.on('keyPressed', _this.onKeyPressed);
        _this.render();
        return _this;
    }
    Object.defineProperty(LeftGamepadEditorTool.prototype, "BUTTON_CONFIG", {
        get: function () {
            return {
                pushMock: gamepadHandler_1.GAMEPAD_BUTTON.Y,
                pullMock: gamepadHandler_1.GAMEPAD_BUTTON.X,
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LeftGamepadEditorTool.prototype, "COLOR", {
        get: function () {
            return LEFT_GAMEPAD_COLOR;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LeftGamepadEditorTool.prototype, "ROTATE_Y_ANGLE", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LeftGamepadEditorTool.prototype, "gamepad", {
        get: function () {
            return this.props.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
        },
        enumerable: true,
        configurable: true
    });
    LeftGamepadEditorTool.prototype.setDisplayImage = function (displayImage) {
        this.display.setImage(displayImage);
        this.render();
    };
    LeftGamepadEditorTool.prototype.getTargetPosition = function () {
        var scene = (this.mesh.parent.parent || this.mesh.parent);
        var tool = this.mesh;
        gamepadHandler_1.attach(this.mockObject, scene, scene);
        var targetPosition = utils_1.threeVector3ToVector3d(this.mockObject.position);
        gamepadHandler_1.attach(this.mockObject, tool, scene);
        return targetPosition;
    };
    LeftGamepadEditorTool.prototype.onDiscard = function () {
        this.props.gamepadHandler.unsubscribe('keyPressed', this.onKeyPressed);
    };
    return LeftGamepadEditorTool;
}(defaultTools_1.GamepadTool));
exports.LeftGamepadEditorTool = LeftGamepadEditorTool;
var RightGamepadEditorTool = /** @class */ (function (_super) {
    tslib_1.__extends(RightGamepadEditorTool, _super);
    function RightGamepadEditorTool(props) {
        var _this = _super.call(this, props) || this;
        _this.forGamepadId = gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER;
        return _this;
    }
    Object.defineProperty(RightGamepadEditorTool.prototype, "BUTTON_CONFIG", {
        get: function () {
            return {
                pushMock: gamepadHandler_1.GAMEPAD_BUTTON.B,
                pullMock: gamepadHandler_1.GAMEPAD_BUTTON.A,
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RightGamepadEditorTool.prototype, "gamepad", {
        get: function () {
            return this.props.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RightGamepadEditorTool.prototype, "COLOR", {
        get: function () {
            return RIGHT_GAMEPAD_COLOR;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RightGamepadEditorTool.prototype, "ROTATE_Y_ANGLE", {
        get: function () {
            return Math.PI;
        },
        enumerable: true,
        configurable: true
    });
    return RightGamepadEditorTool;
}(LeftGamepadEditorTool));
exports.RightGamepadEditorTool = RightGamepadEditorTool;
function renderEditorToolMesh(color, rotateY, mockDist) {
    var group = new THREE.Group();
    var body = utils_1.prepareMesh(tslib_1.__assign(tslib_1.__assign({}, TOOL_MESH), { color: color }));
    body.scale.setScalar(0.005);
    // body.scale.setScalar(1);
    body.rotateX(-Math.PI / 3);
    if (rotateY !== 0) {
        body.rotateY(rotateY);
    }
    var transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4, color: 'blue' });
    var mockObject = new THREE.Group();
    var mockObjectSphere = new THREE.Mesh(new THREE.SphereGeometry(exports.MOC_OBJECT_RADIUS, exports.MOC_OBJECT_RADIUS, exports.MOC_OBJECT_RADIUS), transparentMaterial);
    var mockObjectPlus = utils_1.prepareMesh(PLUS_MESH);
    mockObjectPlus.rotateX(Math.PI / 2);
    mockObjectPlus.scale.setScalar(0.1);
    mockObject.add(mockObjectPlus);
    mockObject.add(mockObjectSphere);
    mockObject.position.setZ(-mockDist);
    group.add(mockObject);
    group.add(body);
    return { group: group, mockObject: mockObject };
}
