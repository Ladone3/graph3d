Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var gamepadHandler_1 = require("../../input/gamepadHandler");
var GamepadsWidgetView = (function () {
    function GamepadsWidgetView(parameters) {
        this.boundingBox = new THREE.Box3();
        this.vrManager = parameters.vrManager;
        this.model = parameters.model;
        var _a = this.model.props, leftTool = _a.leftTool, rightTool = _a.rightTool;
        this.mesh = new THREE.Group();
        if (leftTool) {
            this.leftGamepad = this.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.LEFT_CONTROLLER);
            this.mesh.add(this.leftGamepad);
        }
        if (rightTool) {
            this.rightGamepad = this.vrManager.getController(gamepadHandler_1.OCULUS_CONTROLLERS.RIGHT_CONTROLLER);
            this.mesh.add(this.rightGamepad);
        }
        this.update();
    }
    GamepadsWidgetView.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    GamepadsWidgetView.prototype.update = function () {
        if (this.vrManager.isConnected) {
            this.mesh.visible = true;
            var _a = this.model.props, leftTool = _a.leftTool, rightTool = _a.rightTool;
            if (leftTool) {
                var isLeftMeshChanged = this.leftGamepad.children[0] !== leftTool.mesh;
                if (isLeftMeshChanged) {
                    if (this.leftGamepad.children[0]) {
                        this.leftGamepad.remove(this.leftGamepad.children[0]);
                    }
                    this.leftGamepad.add(leftTool.mesh);
                }
            }
            if (rightTool) {
                var isRightMeshChanged = this.rightGamepad.children[0] !== rightTool.mesh;
                if (isRightMeshChanged) {
                    if (this.rightGamepad.children[0]) {
                        this.rightGamepad.remove(this.rightGamepad.children[0]);
                    }
                    this.rightGamepad.add(rightTool.mesh);
                }
            }
        }
        else {
            this.mesh.visible = false;
        }
    };
    return GamepadsWidgetView;
}());
exports.GamepadsWidgetView = GamepadsWidgetView;
