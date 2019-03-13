"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var THREE = require("three");
var ReactDOM = require("react-dom");
var React = require("react");
var gamepadHandler_1 = require("../../../vrUtils/gamepadHandler");
var utils_1 = require("../../../utils");
var customisation_1 = require("../../../customisation");
var defaultTools_1 = require("./defaultTools");
var htmlToSprite_1 = require("../../../utils/htmlToSprite");
var diagramView_1 = require("../../diagramView");
var StateCore = /** @class */ (function (_super) {
    tslib_1.__extends(StateCore, _super);
    function StateCore() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return StateCore;
}(utils_1.Subscribable));
exports.StateCore = StateCore;
exports.DISPLAY_TARGET_WIDTH = 0.2;
exports.DISPLAY_SCALE = 10000;
exports.MOC_OBJECT_RADIUS = 10;
exports.MOC_OBJECT_NEAR_MARGIN = 20;
var DefaultEditorStateCore = /** @class */ (function (_super) {
    tslib_1.__extends(DefaultEditorStateCore, _super);
    function DefaultEditorStateCore(nodeIdPrefix) {
        var _this = _super.call(this) || this;
        _this.nodeIdPrefix = nodeIdPrefix;
        _this._state = {};
        _this.idCounter = 0;
        var rootHtml = document.createElement('DIV');
        rootHtml.style.position = 'fixed';
        rootHtml.style.top = 'calc(50vh - 50px)';
        rootHtml.style.left = 'calc(50vw - 50px)';
        var holder = document.createElement('DIV');
        holder.style.position = 'relative';
        holder.style.width = '100%';
        holder.style.height = '100%';
        var container = document.createElement('DIV');
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.backgroundColor = 'black';
        holder.appendChild(container);
        rootHtml.appendChild(holder);
        document.body.appendChild(rootHtml);
        _this.container = container;
        _this.rootHtml = rootHtml;
        _this.render();
        return _this;
    }
    Object.defineProperty(DefaultEditorStateCore.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: true,
        configurable: true
    });
    DefaultEditorStateCore.prototype.input = function (keyMap) {
        this.render();
    };
    DefaultEditorStateCore.prototype.render = function () {
        var _this = this;
        var idNumber = this.idCounter++;
        var node = {
            id: this.nodeIdPrefix + "-" + idNumber,
            data: {
                label: "New Node " + idNumber,
                types: ['l3graph-node'],
            },
            position: { x: 0, y: 0, z: 0 },
        };
        ReactDOM.render(React.createElement("div", null,
            React.createElement("h3", { style: { color: 'blue', fontSize: 24, whiteSpace: 'nowrap' } }, node.data.label)), this.container, function () { return _this.onRenderDone(node); });
    };
    DefaultEditorStateCore.prototype.onRenderDone = function (node) {
        var _this = this;
        this.rootHtml.style.display = 'block';
        htmlToSprite_1.htmlToImage(this.container).then(function (img) {
            _this._state = {
                node: node,
                displayImage: img,
            };
            _this.rootHtml.style.display = 'none';
            _this.trigger('update');
        });
    };
    return DefaultEditorStateCore;
}(StateCore));
exports.DefaultEditorStateCore = DefaultEditorStateCore;
var TOOL_MESH = {
    color: 'gray',
    preserveRatio: true,
    type: customisation_1.MeshKind.Obj,
    markup: require('../../../../shapes/gamepadCreator.obj'),
};
var PLUS_MESH = {
    color: 'gray',
    preserveRatio: true,
    type: customisation_1.MeshKind.Obj,
    markup: require('../../../../shapes/plus.obj'),
};
var LEFT_GAMEPAD_COLOR = 'green';
var RIGHT_GAMEPAD_COLOR = 'blue';
var DEFAULT_CREATION_DISTANCE = 150;
var DEFAULT_DISPLAY_MATERIAL = new THREE.MeshLambertMaterial({ color: 'grey' });
var LeftGamepadEditorTool = /** @class */ (function (_super) {
    tslib_1.__extends(LeftGamepadEditorTool, _super);
    function LeftGamepadEditorTool(props) {
        var _this = _super.call(this) || this;
        _this.props = props;
        _this.BUTTON_CONFIG = {
            createButton: gamepadHandler_1.GAMEPAD_BUTTON.LEFT_TRIGGER,
            pushMock: gamepadHandler_1.GAMEPAD_BUTTON.Y,
            pullMock: gamepadHandler_1.GAMEPAD_BUTTON.X,
        };
        _this.render = function () {
            _this.renderDisplay();
        };
        _this.onKeyUp = function (e) {
            if (e.data.has(_this.BUTTON_CONFIG.createButton)) {
                var node = _this.stateController.state.node;
                _this.setPosition(node);
                _this.props.diagramModel.graph.addNodes([node]);
                _this.stateController.input(e.data);
            }
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
        _this.stateController = props.stateCore;
        _this.props.gamepadHandler.on('keyUp', _this.onKeyUp);
        _this.props.gamepadHandler.on('keyPressed', _this.onKeyPressed);
        _this.stateController.on('update', _this.render);
        _this.render();
        return _this;
    }
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
    LeftGamepadEditorTool.prototype.renderDisplay = function () {
        var displayImage = this.stateController.state.displayImage;
        if (this.display) {
            this.mesh.remove(this.display);
            this.display = undefined;
        }
        var display;
        if (displayImage) {
            var scaler = exports.DISPLAY_TARGET_WIDTH * exports.DISPLAY_SCALE / displayImage.width;
            var texture = new THREE.Texture(displayImage);
            texture.anisotropy = 16;
            texture.needsUpdate = true;
            display = new THREE.Mesh(new THREE.PlaneGeometry(displayImage.width * scaler, displayImage.height * scaler), new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
        }
        else {
            display = new THREE.Mesh(new THREE.PlaneGeometry(exports.DISPLAY_TARGET_WIDTH * exports.DISPLAY_SCALE, exports.DISPLAY_TARGET_WIDTH * exports.DISPLAY_SCALE), DEFAULT_DISPLAY_MATERIAL);
        }
        display.scale.setScalar(1 / exports.DISPLAY_SCALE);
        display.position.setX(-exports.DISPLAY_TARGET_WIDTH);
        display.rotateX(-Math.PI / 6);
        this.mesh.add(display);
        this.display = display;
    };
    LeftGamepadEditorTool.prototype.setPosition = function (node) {
        var sceen = this.mesh.parent.parent;
        var tool = this.mesh;
        gamepadHandler_1.attach(this.mockObject, this.mesh.parent.parent, sceen);
        node.position = utils_1.threeVector3ToVector3d(this.mockObject.position);
        gamepadHandler_1.attach(this.mockObject, tool, sceen);
    };
    LeftGamepadEditorTool.prototype.onDiscard = function () {
        this.props.gamepadHandler.unsubscribe('keyUp', this.onKeyUp);
    };
    return LeftGamepadEditorTool;
}(defaultTools_1.GamepadTool));
exports.LeftGamepadEditorTool = LeftGamepadEditorTool;
var RightGamepadEditorTool = /** @class */ (function (_super) {
    tslib_1.__extends(RightGamepadEditorTool, _super);
    function RightGamepadEditorTool(props) {
        var _this = _super.call(this, props) || this;
        _this.BUTTON_CONFIG = {
            createButton: gamepadHandler_1.GAMEPAD_BUTTON.RIGHT_TRIGGER,
            pushMock: gamepadHandler_1.GAMEPAD_BUTTON.B,
            pullMock: gamepadHandler_1.GAMEPAD_BUTTON.A,
        };
        _this.forGamepadId = gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER;
        return _this;
    }
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
    body.rotateX(-Math.PI / 3);
    if (rotateY !== 0) {
        body.rotateY(rotateY);
    }
    var transparentMaterail = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.4, color: 'blue' });
    var mockObject = new THREE.Group();
    var mockObjectSphere = new THREE.Mesh(new THREE.SphereGeometry(exports.MOC_OBJECT_RADIUS, exports.MOC_OBJECT_RADIUS, exports.MOC_OBJECT_RADIUS), transparentMaterail);
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
